import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Select, Card, Tag } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined } from '@ant-design/icons'
import { softDeleteApis } from '@/services/soft-delete-service/soft-delete.apis'

const MODELS = [
  { value: 'products', label: 'Sản phẩm' },
  { value: 'Category', label: 'Danh mục' },
  { value: 'Brand', label: 'Thương hiệu' },
  { value: 'attributes', label: 'Thuộc tính' },
  { value: 'Blog', label: 'Bài viết' },
  { value: 'cateblogs', label: 'Danh mục bài viết' },
  { value: 'users', label: 'Người dùng' },
  { value: 'contacts', label: 'Liên hệ' },
  { value: 'reviews', label: 'Đánh giá' }
]

export default function SoftDeletePage() {
  const [selectedModel, setSelectedModel] = useState('products')
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['soft-delete', selectedModel],
    queryFn: () => softDeleteApis.getDeletedItems(selectedModel, { current: 1, pageSize: 50 }),
    enabled: !!selectedModel
  })

  const restoreMutation = useMutation({
    mutationFn: ({ model, id }: { model: string; id: string }) => 
      softDeleteApis.restoreItem(model, id),
    onSuccess: () => {
      message.success('Khôi phục thành công!')
      refetch()
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: ({ model, id }: { model: string; id: string }) => 
      softDeleteApis.forceDeleteItem(model, id),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn thành công!')
      refetch()
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: ({ model, ids }: { model: string; ids: string[] }) => 
      softDeleteApis.bulkRestore(model, ids),
    onSuccess: () => {
      message.success('Khôi phục hàng loạt thành công!')
      setSelectedRowKeys([])
      refetch()
    }
  })

  const bulkForceDeleteMutation = useMutation({
    mutationFn: ({ model, ids }: { model: string; ids: string[] }) => 
      softDeleteApis.bulkForceDelete(model, ids),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn hàng loạt thành công!')
      setSelectedRowKeys([])
      refetch()
    }
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (text: string) => text.slice(-8)
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        if (selectedModel === 'products') {
          return (
            <div>
              <div>{text}</div>
              {record.categoryId?.name && <small style={{color: '#666'}}>Danh mục: {record.categoryId.name}</small>}
              {record.brandId?.name && <small style={{color: '#666', marginLeft: 8}}>Thương hiệu: {record.brandId.name}</small>}
            </div>
          )
        }
        return text || record.fullName || record.title || record.email || 'N/A'
      }
    },
    {
      title: 'Ngày xóa',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A'
    },
    {
      title: 'Người xóa',
      dataIndex: 'deletedBy',
      key: 'deletedBy',
      render: (deletedBy: any) => deletedBy?.email || 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="red">Đã xóa</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Khôi phục item này?"
            onConfirm={() => restoreMutation.mutate({ model: selectedModel, id: record._id })}
          >
            <Button type="primary" icon={<UndoOutlined />} size="small">
              Khôi phục
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa vĩnh viễn item này?"
            onConfirm={() => forceDeleteMutation.mutate({ model: selectedModel, id: record._id })}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[])
  }

  return (
    <Card title="Quản lý xóa mềm">
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={selectedModel}
          onChange={setSelectedModel}
          options={MODELS}
          style={{ width: 200 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Làm mới
        </Button>
        {selectedRowKeys.length > 0 && (
          <>
            <Popconfirm
              title={`Khôi phục ${selectedRowKeys.length} items?`}
              onConfirm={() => bulkRestoreMutation.mutate({ model: selectedModel, ids: selectedRowKeys })}
            >
              <Button type="primary" icon={<UndoOutlined />}>
                Khôi phục ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
            <Popconfirm
              title={`Xóa vĩnh viễn ${selectedRowKeys.length} items?`}
              onConfirm={() => bulkForceDeleteMutation.mutate({ model: selectedModel, ids: selectedRowKeys })}
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa vĩnh viễn ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          </>
        )}
      </Space>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.data?.data?.results || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          total: data?.data?.data?.meta?.total || 0,
          current: data?.data?.data?.meta?.current || 1,
          pageSize: data?.data?.data?.meta?.pageSize || 50,
          showSizeChanger: false
        }}
      />
    </Card>
  )
}