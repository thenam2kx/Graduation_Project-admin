/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Table, Button, Space, Popconfirm, message, Pagination } from 'antd'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Search from 'antd/es/input/Search'

type Category = { _id: string; name: string }
type Brand = { _id: string; name: string }

const useFetchCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await axios.get('http://localhost:8080/api/v1/categories')
        const categoriesData: Category[] = res.data.data?.results || res.data.results || []
        setCategories(categoriesData)
      } catch (error) {
        message.error('Lấy danh mục thất bại')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return { categories, loading }
}

const useFetchBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true)
      try {
        const res = await axios.get('http://localhost:8080/api/v1/brand')
        const brandsData: Brand[] = res.data.data?.results || res.data.results || []
        setBrands(brandsData)
      } catch (error) {
        message.error('Lấy thương hiệu thất bại')
      } finally {
        setLoading(false)
      }
    }
    fetchBrands()
  }, [])

  return { brands, loading }
}

const ProductPage = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  useFetchCategories()
  useFetchBrands()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/products')
      const productsData = res.data.data?.results || res.data.results || []
      setData(productsData)
    } catch (err) {
      message.error('Lấy danh sách sản phẩm thất bại!')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/products/${id}`)
      message.success('Xóa sản phẩm thành công!')
      fetchData()
    } catch (error) {
      message.error('Xóa sản phẩm thất bại!')
    }
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const columns = [
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
          <Link to={`/products/edit/${record._id}`}>
            <Button type="primary">Sửa</Button>
          </Link>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang quản lý sản phẩm</h1>
      <Link to="/products/add">
        <Button type="primary" style={{ marginBottom: 16, float: 'right' }}>
          Thêm mới
        </Button>
      </Link>
      <Search
        placeholder="Tìm kiếm sản phẩm..."
        allowClear
        enterButton="Tìm"
        size="middle"
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={paginatedData}
        loading={loading}
        pagination={false}
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={data.length}
          onChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default ProductPage
