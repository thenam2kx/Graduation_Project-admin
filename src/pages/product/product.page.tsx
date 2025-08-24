import { deleteProductAPI, fetchAllProducts } from '@/services/product-service/product.apis'
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key'
import { getAllBrandsAPI } from '@/services/brand-service/brand.apis'
import { getAllCategoriesAPI } from '@/services/category-service/category.apis'
import { DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, message, Popconfirm, Space, Table, Select, Row, Col, Card } from 'antd'
import Search from 'antd/es/input/Search'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import ProductDetailModal from './product-detail.modal'
import './product.filter.css'

const ProductPage = () => {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const queryClient = useQueryClient()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
      setPagination(prev => ({ ...prev, current: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue])

  const { data: listProducts, isLoading } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL, pagination.current, pagination.pageSize, debouncedSearch, selectedBrand, selectedCategory],
    queryFn: async () => {
      try {
        let params = `?current=${pagination.current}&pageSize=${pagination.pageSize}&sort=-createdAt`
        if (debouncedSearch) params += `&name=${encodeURIComponent(debouncedSearch)}`
        if (selectedBrand) params += `&brandId=${selectedBrand}`
        if (selectedCategory) params += `&categoryId=${selectedCategory}`
        
        const res = await fetchAllProducts(params)
        if (res && res.data) {
          return res.data
        } else {
          throw new Error('Không có dữ liệu trả về từ API')
        }
      } catch (error) {
        message.error('Lấy danh sách sản phẩm thất bại!')
        throw error
      }
    },
    enabled: true
  })

  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => {
      const res = await getAllBrandsAPI()
      return res?.data || []
    }
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await getAllCategoriesAPI()
      return res?.data || []
    }
  })
  // Debug log removed for production

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteProductAPI(id)
      if (res && res.data) {
        return res.data
      } else {
        throw new Error('Xóa sản phẩm thất bại!')
      }
    },
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Sản phẩm đã tồn tại trong đơn hàng, không thể xóa !')
    }
  })

  const handleDelete = (id: string) => {
    deleteProductMutation.mutate(id)
  }

  const handleViewDetail = (product: IProduct) => {
    setSelectedProduct(product)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedProduct(null)
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setDebouncedSearch('')
    setSelectedBrand(undefined)
    setSelectedCategory(undefined)
    setPagination({ current: 1, pageSize: 10, total: 10 })
  }

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (images: string | string[], record: any) => {
        // Kiểm tra nếu images là mảng (album ảnh)
        if (Array.isArray(images) && images.length > 0) {
          // Hiển thị ảnh đầu tiên trong album (ảnh chính)
          return (
            <img
              src={images[0]}
              alt="Ảnh sản phẩm"
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
              crossOrigin="anonymous"
            />
          )
        } else if (typeof images === 'string') {
          // Nếu chỉ có một ảnh
          return (
            <img
              src={images}
              alt="Ảnh sản phẩm"
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
              crossOrigin="anonymous"
            />
          )
        }
        // Trường hợp không có ảnh
        return <span>Không có ảnh</span>
      }
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
      render: (price: number, product: IProduct) => {
        return <span>{product?.variants && product.variants.length > 0 ? product.variants[0].price : price}</span>
      }
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, product: IProduct) => {
        if (product?.variants && product.variants.length > 0) {
          const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
          return <span>{totalStock}</span>
        }
        return <span>{stock || 0}</span>
      }
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brandId',
      key: 'brandId',
      render: (brand: any) => brand?.name || 'Không có thương hiệu'
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
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            className='text-green-600 border-green-600 hover:text-green-500 hover:border-green-500'
            onClick={() => handleViewDetail(record)}
          />
          <Link to={`/products/edit/${record._id}`}>
            <Button
              icon={<EditOutlined />}
              className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500'
            />
          </Link>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này không?"
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
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Trang quản lý sản phẩm</h1>
        <Link to="/products/add">
          <Button type="primary">
            Thêm mới
          </Button>
        </Link>
      </div>

      <Card className="product-filter-container" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6} className="filter-item">
            <Search
              placeholder="Tìm kiếm theo tên sản phẩm..."
              allowClear
              enterButton="Tìm"
              size="middle"
              onChange={e => handleSearch(e.target.value)}
              onSearch={handleSearch}
              value={searchValue}
              loading={searchValue !== debouncedSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} className="filter-item">
            <Select
              placeholder="Lọc theo thương hiệu"
              allowClear
              style={{ width: '100%' }}
              value={selectedBrand}
              onChange={setSelectedBrand}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                ...(brands?.map(brand => ({ value: brand._id, label: brand.name })) || [])
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} className="filter-item">
            <Select
              placeholder="Lọc theo danh mục"
              allowClear
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                ...(categories?.map(category => ({ value: category._id, label: category.name })) || [])
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} className="filter-item">
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearFilters}
              className="filter-clear-btn"
              style={{ width: '100%' }}
              disabled={!searchValue && !selectedBrand && !selectedCategory}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {(debouncedSearch || selectedBrand || selectedCategory) && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f0f8ff', borderRadius: 4, border: '1px solid #d6e4ff' }}>
          <span style={{ color: '#1890ff', fontSize: '14px' }}>
            <FilterOutlined style={{ marginRight: 8 }} />
            Đang lọc: {listProducts?.meta.total || 0} sản phẩm
            {debouncedSearch && <span style={{ marginLeft: 8 }}>• Từ khóa: "{debouncedSearch}"</span>}
            {selectedBrand && <span style={{ marginLeft: 8 }}>• Thương hiệu: {brands?.find(b => b._id === selectedBrand)?.name}</span>}
            {selectedCategory && <span style={{ marginLeft: 8 }}>• Danh mục: {categories?.find(c => c._id === selectedCategory)?.name}</span>}
          </span>
        </div>
      )}

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={listProducts?.results || []}
        loading={isLoading}
        pagination={{
          total: listProducts?.meta.total || 0,
          pageSize: listProducts?.meta.pageSize || 10,
          current: listProducts?.meta.current || 1,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: listProducts?.meta.total || 0 })
        }}
      />
      
      <ProductDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  )
}

export default ProductPage
