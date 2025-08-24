import instance from '@/config/axios.customize'
import { IBrand } from '@/types/brand'
import { DeleteOutlined, EditOutlined, FolderAddFilled, EyeOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Popconfirm, Switch, Table, Modal, Form, Input, Select, message, Space, Spin, Pagination } from 'antd'
import axios from 'axios'
import { debounce } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

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

interface Product {
  _id: string
  name: string
  image: string
  price: number
  stock: number
  brandId?: { name: string }
  categoryId?: { name: string }
  createdAt: string
}


const Brand = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingID, setEditingID] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [data, setData] = useState<IBrand[]>([])
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })
  const [currentSlug, setCurrentSlug] = useState('')

  // States for products modal
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [selectedBrandName, setSelectedBrandName] = useState('')
  const [productsData, setProductsData] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsPagination, setProductsPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const [productsSearchTerm, setProductsSearchTerm] = useState('')

  const ListBrand = async (qs?: string) => {
    try {
      const url = `/api/v1/brand?current=${pagination.current}&pageSize=${pagination.pageSize}${qs ? `&qs=${encodeURIComponent(qs)}` : ''}`
      const res = await instance.get(url)
      console.log('Request URL:', url)

      const results = res?.data?.results || []
      setData(results)
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.meta?.total || results.length
      }))
    } catch (error) {
      message.error('Không thể tải danh sách thương hiệu')
      setData([])
    }
  }
  const debounceSearch = useMemo(() =>
    debounce((text: string) => {
      ListBrand(text)
    }, 500), [pagination.current, pagination.pageSize]
  )

  useEffect(() => {
    const fetchData = async () => {
      await ListBrand(searchText)
    }
    fetchData()
  }, [debounceSearch,pagination.current, pagination.pageSize, searchText])

  const handleAdd = () => {
    setModalMode('add')
    form.resetFields()
    setCurrentSlug('')
    setImage('')
    setModalOpen(true)
  }

  const handleEdit = (brand: IBrand) => {
    setModalMode('edit')
    setEditingID(brand._id)
    form.setFieldsValue({
      name: brand.name,
      slug: brand.slug,
      avatar: brand.avatar
    })
    setCurrentSlug(brand.slug)
    setImage(brand.avatar || '')
    setModalOpen(true)
  }

  const handleFinish = async (values: IBrand) => {
    try {
      if (modalMode === 'add') {
        // Không gửi slug khi thêm mới, để server tự động tạo
        const { slug, ...createData } = values
        await instance.post('/api/v1/brand/', createData)
        message.success('Thêm thương hiệu thành công')
      } else if (modalMode === 'edit' && editingID) {
        // Không gửi slug khi sửa, để server tự động tạo từ name
        const { slug, ...updateData } = values
        await instance.patch(`/api/v1/brand/${editingID}`, updateData)
        message.success('Cập nhật thương hiệu thành công')
      }
      setModalOpen(false)
      ListBrand()
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error(error.response?.data?.message || 'Tên thương hiệu đã tồn tại')
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại')
      }
      console.log(error)
    }
  }

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await instance.delete(`/api/v1/brand/${id}`)
      } catch (error: any) {
        console.log(error)
      }
    },
    onSuccess: () => {
      message.success('Xóa thành công')
      ListBrand()
    }
  })
  const handleDelete = (id: string) => {
    mutation.mutate(id)
  }

  // Fetch products for a specific brand
  const fetchProducts = async (brandId: string, page: number, pageSize: number, search: string) => {
    setProductsLoading(true)
    try {
      let url = `/api/v1/products?current=${page}&pageSize=${pageSize}&brandId=${encodeURIComponent(brandId)}`
      if (search) {
        url += `&qs=${encodeURIComponent(search)}`
      }
      const res = await instance.get(url)
      setProductsData(res.data?.results || [])
      setProductsPagination(prev => ({
        ...prev,
        total: res.data?.meta?.total || 0,
        current: res.data?.meta?.current || page,
        pageSize: res.data?.meta?.pageSize || pageSize
      }))
    } catch (err) {
      message.error('Lấy danh sách sản phẩm thất bại!')
      setProductsData([])
      setProductsPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setProductsLoading(false)
    }
  }

  // Open Modal to view related products
  const handleViewProducts = async (record: IBrand) => {
    setSelectedBrandId(record._id)
    setSelectedBrandName(record.name)
    setProductsSearchTerm('')
    setProductsPagination({ current: 1, pageSize: 5, total: 0 })
    await fetchProducts(record._id, 1, 5, '')
    setProductsModalOpen(true)
  }

  // Close products Modal
  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedBrandId(null)
    setSelectedBrandName('')
    setProductsData([])
    setProductsSearchTerm('')
    setProductsPagination({ current: 1, pageSize: 5, total: 0 })
  }
  const uploadImage = async (file: FileList | null) => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file[0])
    formData.append('upload_preset', 'reacttest')

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      )
      setImage(data.url)
      form.setFieldsValue({ avatar: data.url })
      setLoading(false)
    } catch (error) {
      console.error('Upload thất bại:', error)
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug'
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) =>
        avatar ? (
          <img
            src={avatar}
            alt="avatar"
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span>Không có ảnh</span>
        )
    },

    {
      title: 'Thao tác',
      key: 'action',
      render: (record: IBrand) =>
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewProducts(record)}
            className="text-green-600 border-green-600 hover:text-green-500 hover:border-green-500"
            title="Xem sản phẩm liên quan"
          />
          <Button
            icon={<EditOutlined />}
            className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500'
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa thương hiệu này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              icon={<DeleteOutlined />}
              className='text-red-600 border-red-600 hover:text-red-500 hover:border-red-500'
            />
          </Popconfirm>
        </Space>
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý thương hiệu</h1>
          <p className='text-gray-500'>Quản lý thương hiệu trong hệ thống</p>
          <Input.Search
            placeholder="Tìm kiếm thương hiệu"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              setSearchText(value)
              ListBrand(value)
            }}
            style={{ width: 300 }}
          />

        </div>
        <div style={{}} >
          <Button type='primary' onClick={handleAdd}>
            <FolderAddFilled /> Thêm thương hiệu
          </Button>
        </div>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(data) => data._id}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize
            }))
          }
        }}
/>

      <Modal
        open={modalOpen}
        title={modalMode === 'add' ? 'Thêm thương hiệu' : 'Cập nhật thương hiệu'}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        destroyOnClose
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 5, message: 'Tối thiểu 5 ký tự' }
            ]}
          >
            <Input 
              onChange={(e) => {
                const name = e.target.value
                form.setFieldValue('name', name)
                
                if (name.trim()) {
                  const newSlug = createSlug(name)
                  setCurrentSlug(newSlug)
                  form.setFieldValue('slug', newSlug)
                } else {
                  setCurrentSlug('')
                  form.setFieldValue('slug', '')
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 5, message: 'Tối thiểu 5 ký tự' }
            ]}
          >
            <Input 
              placeholder="Slug tự động tạo từ tên"
              style={{ 
                backgroundColor: '#f5f5f5', 
                cursor: 'not-allowed',
                color: '#666'
              }}
              disabled
            />
          </Form.Item>
          <Form.Item
            label="Ảnh đại diện"
          >
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files)}
              className="w-full p-3 border rounded-lg"
            />
            {loading && <p className="text-blue-500 mt-2">Đang tải ảnh...</p>}
            {image && (
              <img
                src={image}
                alt="Uploaded"
                className="mt-2 w-32 h-32 object-cover rounded"
                style={{ display: 'block', margin: '0 auto', width: '350px', height: '350px' }}
              />
            )}
          </Form.Item>
          <Form.Item name="avatar" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
            <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for viewing related products */}
      <Modal
        title={`Sản phẩm thuộc thương hiệu: ${selectedBrandName}`}
        open={productsModalOpen}
        onCancel={handleCloseProductsModal}
        footer={null}
        destroyOnClose
        width={800}
      >
        <Spin spinning={productsLoading}>
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton="Tìm"
            size="middle"
            style={{ marginBottom: 16, maxWidth: 300 }}
            onSearch={value => {
              setProductsSearchTerm(value)
              setProductsPagination(prev => ({ ...prev, current: 1 }))
              if (selectedBrandId) {
                fetchProducts(selectedBrandId, 1, productsPagination.pageSize, value)
              }
            }}
          />
          <Table
            rowKey="_id"
            columns={[
              {
                title: 'Ảnh',
                dataIndex: 'image',
                key: 'image',
                render: (url: string) => (
                  <img
                    src={url}
                    alt="Ảnh sản phẩm"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                  />
                )
              },
              {
                title: 'Tên sản phẩm',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: 'Giá',
                dataIndex: 'price',
                key: 'price',
                render: (price: number) => `${price.toLocaleString()} ₫`
              },
              {
                title: 'Tồn kho',
                dataIndex: 'stock',
                key: 'stock'
              },
              {
                title: 'Danh mục',
                dataIndex: 'categoryId',
                key: 'categoryId',
                render: (category: any) => category?.name || 'Không có danh mục'
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date: string) => new Date(date).toLocaleString()
              }
            ]}
            dataSource={productsData}
            pagination={false}
            loading={productsLoading}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={productsPagination.current}
              pageSize={productsPagination.pageSize}
              total={productsPagination.total}
              onChange={(page, pageSize) => {
                setProductsPagination(prev => ({ ...prev, current: page, pageSize }))
                if (selectedBrandId) {
                  fetchProducts(selectedBrandId, page, pageSize, productsSearchTerm)
                }
              }}
            />
          </div>
        </Spin>
      </Modal>
    </div>
  )
}

export default Brand