import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Card, Tag, Input } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function CategoryTrashPage() {
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categories-trash', searchText],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8080/api/v1/categories/trash`, {
        params: { current: 1, pageSize: 50, qs: searchText || '' }
      })
      console.log('Category trash response:', response.data)
      return response.data
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`http://localhost:8080/api/v1/categories/restore/${id}`),
    onSuccess: () => {
      message.success('Khôi phục danh mục thành công!')
      refetch()
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:8080/api/v1/categories/force-delete/${id}`),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn danh mục thành công!')
      refetch()
    }
  })

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Ngày xóa', dataIndex: 'deletedAt', key: 'deletedAt', render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A' },
    { title: 'Trạng thái', key: 'status', render: () => <Tag color="red">Đã xóa</Tag> },
    {
      title: 'Thao tác', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Popconfirm title="Khôi phục danh mục này?" onConfirm={() => restoreMutation.mutate(record._id)}>
            <Button type="primary" icon={<UndoOutlined />} size="small">Khôi phục</Button>
          </Popconfirm>
          <Popconfirm title="Xóa vĩnh viễn danh mục này?" onConfirm={() => forceDeleteMutation.mutate(record._id)}>
            <Button danger icon={<DeleteOutlined />} size="small">Xóa vĩnh viễn</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card title="Thùng rác danh mục">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
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
          showTotal: (total) => `Tổng ${total} danh mục đã xóa`
        }}
      />
    </Card>
  )
}