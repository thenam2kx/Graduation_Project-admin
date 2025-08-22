import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Card, Tag, Input } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function ProductTrashPage() {
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products-trash', searchText],
    queryFn: () => axios.get(`http://localhost:8080/api/v1/products/trash`, {
      params: { current: 1, pageSize: 50, qs: searchText || '' }
    }).then(res => res.data)
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`http://localhost:8080/api/v1/products/restore/${id}`),
    onSuccess: () => {
      message.success('Khôi phục sản phẩm thành công!')
      refetch()
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:8080/api/v1/products/force-delete/${id}`),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn sản phẩm thành công!')
      refetch()
    }
  })

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: 100, render: (text: string) => text.slice(-8) },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Danh mục', dataIndex: ['categoryId', 'name'], key: 'category' },
    { title: 'Thương hiệu', dataIndex: ['brandId', 'name'], key: 'brand' },
    { title: 'Ngày xóa', dataIndex: 'deletedAt', key: 'deletedAt', render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A' },
    { title: 'Trạng thái', key: 'status', render: () => <Tag color="red">Đã xóa</Tag> },
    {
      title: 'Thao tác', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Popconfirm title="Khôi phục sản phẩm này?" onConfirm={() => restoreMutation.mutate(record._id)}>
            <Button type="primary" icon={<UndoOutlined />} size="small">Khôi phục</Button>
          </Popconfirm>
          <Popconfirm title="Xóa vĩnh viễn sản phẩm này?" onConfirm={() => forceDeleteMutation.mutate(record._id)}>
            <Button danger icon={<DeleteOutlined />} size="small">Xóa vĩnh viễn</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card title="Thùng rác sản phẩm">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data?.data?.results || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          total: data?.data?.meta?.total || 0,
          current: data?.data?.meta?.current || 1,
          pageSize: data?.data?.meta?.pageSize || 50,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sản phẩm đã xóa`
        }}
      />
    </Card>
  )
}