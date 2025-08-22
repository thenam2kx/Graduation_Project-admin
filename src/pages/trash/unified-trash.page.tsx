import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Card, Tag, Input, Select } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import axios from '@/config/axios.customize'

const { Option } = Select

type TrashType = 'products' | 'categories' | 'brand' | 'blogs' | 'cateblog' | 'attributes'

const trashOptions = [
  { value: 'products', label: 'Sản phẩm', endpoint: '/api/v1/products/trash', restoreEndpoint: '/api/v1/products/restore', forceDeleteEndpoint: '/api/v1/products/force-delete' },
  { value: 'categories', label: 'Danh mục', endpoint: '/api/v1/categories/trash', restoreEndpoint: '/api/v1/categories/restore', forceDeleteEndpoint: '/api/v1/categories/force-delete' },
  { value: 'brand', label: 'Thương hiệu', endpoint: '/api/v1/brand/trash', restoreEndpoint: '/api/v1/brand/restore', forceDeleteEndpoint: '/api/v1/brand/force-delete' },
  { value: 'blogs', label: 'Bài viết', endpoint: '/api/v1/blogs/trash', restoreEndpoint: '/api/v1/blogs/restore', forceDeleteEndpoint: '/api/v1/blogs/force-delete' },
  { value: 'cateblog', label: 'Danh mục bài viết', endpoint: '/api/v1/cateblog/trash', restoreEndpoint: '/api/v1/cateblog/restore', forceDeleteEndpoint: '/api/v1/cateblog/force-delete' },
  { value: 'attributes', label: 'Thuộc tính', endpoint: '/api/v1/attributes/trash', restoreEndpoint: '/api/v1/attributes/restore', forceDeleteEndpoint: '/api/v1/attributes/force-delete' }
]

export default function UnifiedTrashPage() {
  const [selectedType, setSelectedType] = useState<TrashType>('products')
  const [searchText, setSearchText] = useState('')

  const currentOption = trashOptions.find(opt => opt.value === selectedType)!

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unified-trash', selectedType, searchText],
    queryFn: async () => {
      const params = `?current=1&pageSize=10${searchText ? `&qs=${searchText}` : ''}`
      const response = await axios.get(`${currentOption.endpoint}${params}`)
      return response.data
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`${currentOption.restoreEndpoint}/${id}`),
    onSuccess: () => {
      message.success(`Khôi phục ${currentOption.label.toLowerCase()} thành công!`)
      refetch()
    },
    onError: (error: any) => {
      message.error(`Lỗi khôi phục: ${error.response?.data?.message || error.message}`)
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${currentOption.forceDeleteEndpoint}/${id}`),
    onSuccess: () => {
      message.success(`Xóa vĩnh viễn ${currentOption.label.toLowerCase()} thành công!`)
      refetch()
    },
    onError: (error: any) => {
      message.error(`Lỗi xóa vĩnh viễn: ${error.response?.data?.message || error.message}`)
    }
  })

  const getColumns = () => {
    const baseColumns = [
      { 
        title: 'Tên', 
        dataIndex: selectedType === 'products' ? 'name' : selectedType === 'blogs' ? 'title' : 'name', 
        key: 'name',
        width: '30%'
      },
      { 
        title: 'Slug', 
        dataIndex: 'slug', 
        key: 'slug',
        width: '25%'
      },
      { 
        title: 'Ngày xóa', 
        dataIndex: 'deletedAt', 
        key: 'deletedAt', 
        render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        width: '20%'
      },
      { 
        title: 'Trạng thái', 
        key: 'status', 
        render: () => <Tag color="red">Đã xóa</Tag>,
        width: '10%'
      },
      {
        title: 'Thao tác', 
        key: 'action', 
        render: (_: any, record: any) => (
          <Space>
            <Popconfirm 
              title={`Khôi phục ${currentOption.label.toLowerCase()} này?`} 
              onConfirm={() => restoreMutation.mutate(record._id)}
            >
              <Button type="primary" icon={<UndoOutlined />} size="small">Khôi phục</Button>
            </Popconfirm>
            <Popconfirm 
              title={`Xóa vĩnh viễn ${currentOption.label.toLowerCase()} này?`} 
              onConfirm={() => forceDeleteMutation.mutate(record._id)}
            >
              <Button danger icon={<DeleteOutlined />} size="small">Xóa vĩnh viễn</Button>
            </Popconfirm>
          </Space>
        ),
        width: '15%'
      }
    ]

    return baseColumns
  }

  const handleTypeChange = (value: TrashType) => {
    setSelectedType(value)
    setSearchText('')
  }

  return (
    <Card title="Thùng rác tổng hợp">
      <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
        <Space>
          <Select
            value={selectedType}
            onChange={handleTypeChange}
            style={{ width: 200 }}
            placeholder="Chọn loại thùng rác"
          >
            {trashOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Input
            placeholder={`Tìm kiếm ${currentOption.label.toLowerCase()}...`}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
        </Space>
      </Space>

      <Table
        columns={getColumns()}
        dataSource={data?.data?.results || data?.results || []}
        rowKey="_id"
        loading={isLoading}
pagination={{
          total: data?.data?.meta?.total || data?.meta?.total || 0,
          current: data?.data?.meta?.current || data?.meta?.current || 1,
          pageSize: data?.data?.meta?.pageSize || data?.meta?.pageSize || 10,
          showSizeChanger: false,
          showTotal: false
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  )
}