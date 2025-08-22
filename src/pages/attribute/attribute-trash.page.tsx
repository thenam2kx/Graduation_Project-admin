import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Table, Space, message, Popconfirm, Card, Tag, Input } from 'antd'
import { DeleteOutlined, UndoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { attributeApis } from '@/services/product-service/attributes.apis'

export default function AttributeTrashPage() {
  const [searchText, setSearchText] = useState('')


  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attributes-trash', searchText],
    queryFn: () => attributeApis.getTrashAttributes({ 
      current: 1, 
      pageSize: 50,
      qs: searchText || '' 
    })
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => attributeApis.restoreAttribute(id),
    onSuccess: () => {
      message.success('Khôi phục thuộc tính thành công!')
      refetch()
    },
    onError: () => {
      message.error('Khôi phục thuộc tính thất bại!')
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: string) => attributeApis.forceDeleteAttribute(id),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn thuộc tính thành công!')
      refetch()
    },
    onError: () => {
      message.error('Xóa vĩnh viễn thuộc tính thất bại!')
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
      title: 'Tên thuộc tính',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug'
    },
    {
      title: 'Ngày xóa',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A'
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
            title="Khôi phục thuộc tính này?"
            description="Thuộc tính sẽ được khôi phục về trang quản lý thuộc tính"
            onConfirm={() => restoreMutation.mutate(record._id)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button type="primary" icon={<UndoOutlined />} size="small">
              Khôi phục
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa vĩnh viễn thuộc tính này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => forceDeleteMutation.mutate(record._id)}
            okText="Xóa vĩnh viễn"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]



  return (
    <Card title="Thùng rác thuộc tính">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm thuộc tính..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Làm mới
        </Button>
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
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} thuộc tính đã xóa`
        }}
      />
    </Card>
  )
}