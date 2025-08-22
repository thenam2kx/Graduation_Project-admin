/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Pagination,
  Input,
  Form
} from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

// Function tạo slug
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space, dấu gạch
    .replace(/\s+/g, '-') // Thay space bằng dấu gạch
    .replace(/-+/g, '-') // Bỏ dấu gạch thừa
    .trim()
}


interface ICateblog {
  _id?: string
  name: string
  slug: string
  createdAt?: string
}

const BlogCategoryPage = () => {
  const [data, setData] = useState<ICateblog[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm<ICateblog>()
  const [editingItem, setEditingItem] = useState<ICateblog | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentSlug, setCurrentSlug] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/cateblog')
      setData(res.data.data?.results || [])
    } catch (err) {
      message.error('Lấy danh sách danh mục thất bại!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Debounce cho ô tìm kiếm
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if (isModalOpen && isEdit && editingItem) {
      setTimeout(() => {
        form.setFieldsValue({
          name: editingItem.name,
          slug: editingItem.slug
        })
      }, 0)
    }
  }, [isModalOpen, isEdit, editingItem, form])

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const openAddModal = () => {
    form.resetFields()
    setIsEdit(false)
    setEditingItem(null)
    setCurrentSlug('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: ICateblog) => {
    setIsEdit(true)
    setEditingItem(item)
    setCurrentSlug(item.slug)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/cateblog/${id}`)
      message.success('Xóa danh mục thành công!')
      fetchData()
    } catch (error) {
      message.error('Xóa danh mục thất bại!')
    }
  }

  const handleSubmit = async (values: ICateblog) => {
    try {
      if (isEdit && editingItem?._id) {
        await axios.patch(
          `http://localhost:8080/api/v1/cateblog/${editingItem._id}`,
          values
        )
        message.success('Chỉnh sửa danh mục thành công!')
      } else {
        await axios.post('http://localhost:8080/api/v1/cateblog', values)
        message.success('Thêm danh mục thành công!')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error(error.response?.data?.message || 'Tên danh mục bài viết đã tồn tại')
      } else {
        message.error('Lưu thất bại, vui lòng thử lại!')
      }
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setCurrentSlug('')
  }

  // Xử lý khi thay đổi tên để tự động tạo slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
    
    if (name.trim()) {
      // Tạo slug từ tên (cả khi thêm mới và chỉnh sửa)
      const newSlug = createSlug(name)
      setCurrentSlug(newSlug)
      form.setFieldValue('slug', newSlug)
    } else {
      setCurrentSlug('')
      form.setFieldValue('slug', '')
    }
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang danh mục bài viết</h1>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          allowClear
          size="middle"
          style={{ maxWidth: 300 }}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <Button type="primary" onClick={openAddModal}>
          Thêm mới
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={[
          {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) =>
              date ? new Date(date).toLocaleString('vi-VN') : ''
          },
          {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: ICateblog) => (
              <Space size="middle">
                <Button icon={<EditOutlined />}
                  className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500' onClick={() => openEditModal(record)}/>
                <Popconfirm
                  title="Bạn có chắc muốn xóa danh mục này không?"
                  onConfirm={() => handleDelete(record._id!)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    className='text-red-600 border-red-600 hover:text-red-500 hover:border-red-500'
                  />
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={paginatedData}
        loading={loading}
        pagination={false}
      />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={handlePageChange}
        />
      </div>

      <Modal
        title={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input 
              placeholder="Nhập tên danh mục" 
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug sẽ được tự động tạo!' }]}
          >
            <Input 
              placeholder="Slug tự động tạo từ tên" 
              value={currentSlug}
              readOnly
              style={{ 
                backgroundColor: '#f5f5f5', 
                cursor: 'not-allowed',
                color: '#666'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BlogCategoryPage
