import React, { useState } from 'react'
import { 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Select, 
  Input, 
  Card,
  Tag,
  Tooltip,
  Row,
  Col
} from 'antd'
import { 
  UndoOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { 
  useGetDeletedItemsQuery,
  useRestoreItemMutation,
  useForceDeleteItemMutation,
  useBulkRestoreMutation,
  useBulkForceDeleteMutation,
  SoftDeleteItem
} from '../../services/soft-delete.service'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input

const modelOptions = [
  { value: 'products', label: 'Sản phẩm', color: 'blue' },
  { value: 'categories', label: 'Danh mục', color: 'green' },
  { value: 'BrandNew', label: 'Thương hiệu', color: 'orange' },
  { value: 'attributes', label: 'Thuộc tính', color: 'purple' },
  { value: 'blogs', label: 'Bài viết', color: 'cyan' },
  { value: 'cateblogs', label: 'Danh mục blog', color: 'magenta' }
]

const SoftDeletePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('products')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  // API hooks
  const { data, isLoading, refetch } = useGetDeletedItemsQuery({
    modelName: selectedModel,
    current: currentPage,
    pageSize,
    search: searchText
  })

  const [restoreItem] = useRestoreItemMutation()
  const [forceDeleteItem] = useForceDeleteItemMutation()
  const [bulkRestore] = useBulkRestoreMutation()
  const [bulkForceDelete] = useBulkForceDeleteMutation()

  const handleRestore = async (id: string) => {
    try {
      await restoreItem({ modelName: selectedModel, id }).unwrap()
      message.success('Khôi phục thành công!')
    } catch (error) {
      message.error('Khôi phục thất bại!')
    }
  }

  const handleForceDelete = async (id: string) => {
    try {
      await forceDeleteItem({ modelName: selectedModel, id }).unwrap()
      message.success('Xóa vĩnh viễn thành công!')
    } catch (error) {
      message.error('Xóa vĩnh viễn thất bại!')
    }
  }

  const handleBulkRestore = async () => {
    try {
      const result = await bulkRestore({ 
        modelName: selectedModel, 
        ids: selectedRowKeys 
      }).unwrap()
      message.success(`Khôi phục ${result.data.restored} mục thành công!`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('Khôi phục hàng loạt thất bại!')
    }
  }

  const handleBulkForceDelete = async () => {
    try {
      const result = await bulkForceDelete({ 
        modelName: selectedModel, 
        ids: selectedRowKeys 
      }).unwrap()
      message.success(`Xóa vĩnh viễn ${result.data.deleted} mục thành công!`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('Xóa vĩnh viễn hàng loạt thất bại!')
    }
  }

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SoftDeleteItem) => 
        text || record.title || record._id
    },
    {
      title: 'Ngày xóa',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Người xóa',
      dataIndex: 'deletedBy',
      key: 'deletedBy',
      render: (deletedBy: string) => deletedBy || 'N/A'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: SoftDeleteItem) => (
        <Space>
          <Tooltip title="Khôi phục">
            <Popconfirm
              title="Bạn có chắc muốn khôi phục mục này?"
              onConfirm={() => handleRestore(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                type="primary" 
                icon={<UndoOutlined />} 
                size="small"
              />
            </Popconfirm>
          </Tooltip>
          
          <Tooltip title="Xóa vĩnh viễn">
            <Popconfirm
              title="Bạn có chắc muốn xóa vĩnh viễn? Hành động này không thể hoàn tác!"
              onConfirm={() => handleForceDelete(record._id)}
              okText="Có"
              cancelText="Không"
              okType="danger"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  }

  const currentModelOption = modelOptions.find(opt => opt.value === selectedModel)

  return (
    <div className="p-6">
      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={6}>
            <Select
              value={selectedModel}
              onChange={(value) => {
                setSelectedModel(value)
                setCurrentPage(1)
                setSelectedRowKeys([])
              }}
              style={{ width: '100%' }}
              placeholder="Chọn loại dữ liệu"
            >
              {modelOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm..."
              allowClear
              onSearch={(value) => {
                setSearchText(value)
                setCurrentPage(1)
              }}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col span={10}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
              >
                Làm mới
              </Button>
              
              {selectedRowKeys.length > 0 && (
                <>
                  <Popconfirm
                    title={`Khôi phục ${selectedRowKeys.length} mục đã chọn?`}
                    onConfirm={handleBulkRestore}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="primary" icon={<UndoOutlined />}>
                      Khôi phục ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                  
                  <Popconfirm
                    title={`Xóa vĩnh viễn ${selectedRowKeys.length} mục đã chọn? Hành động này không thể hoàn tác!`}
                    onConfirm={handleBulkForceDelete}
                    okText="Có"
                    cancelText="Không"
                    okType="danger"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Xóa vĩnh viễn ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </Col>
        </Row>

        <div className="mb-4">
          <Tag color={currentModelOption?.color} className="text-lg px-3 py-1">
            {currentModelOption?.label} đã xóa
          </Tag>
          {data?.data.meta.total && (
            <span className="ml-2 text-gray-500">
              ({data.data.meta.total} mục)
            </span>
          )}
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data?.data.results || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.data.meta.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} mục`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size || 10)
            }
          }}
        />
      </Card>
    </div>
  )
}

export default SoftDeletePage