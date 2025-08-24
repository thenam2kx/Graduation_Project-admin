import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Card, Tag, Input } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import axios from '@/config/axios.customize'

export default function BlogCategoryTrashPage() {
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cateblog-trash', searchText],
    queryFn: async () => {
      const params = `?current=1&pageSize=50${searchText ? `&qs=${searchText}` : ''}`
      const response = await axios.get(`/api/v1/cateblog/trash${params}`)
      return response.data
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/v1/cateblog/restore/${id}`),
    onSuccess: () => {
      message.success('Khôi phục danh mục bài viết thành công!')
      refetch()
    },
    onError: (error: any) => {
      message.error(`Lỗi khôi phục: ${error.response?.data?.message || error.message}`)
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/cateblog/force-delete/${id}`),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn danh mục bài viết thành công!')
      refetch()
    },
    onError: (error: any) => {
      message.error(`Lỗi xóa vĩnh viễn: ${error.response?.data?.message || error.message}`)
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
          <Popconfirm title="Khôi phục danh mục bài viết này?" onConfirm={() => restoreMutation.mutate(record._id)}>
            <Button type="primary" icon={<UndoOutlined />} size="small">Khôi phục</Button>
          </Popconfirm>
          <Popconfirm title="Xóa vĩnh viễn danh mục bài viết này?" onConfirm={() => forceDeleteMutation.mutate(record._id)}>
            <Button danger icon={<DeleteOutlined />} size="small">Xóa vĩnh viễn</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card title="Thùng rác danh mục bài viết">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm danh mục bài viết..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data?.data?.results || data?.results || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          total: data?.data?.meta?.total || data?.meta?.total || 0,
          current: data?.data?.meta?.current || data?.meta?.current || 1,
          pageSize: data?.data?.meta?.pageSize || data?.meta?.pageSize || 50,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} danh mục bài viết đã xóa`
        }}
      />
    </Card>
  )
}