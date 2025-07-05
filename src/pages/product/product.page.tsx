import { deleteProductAPI, fetchAllProducts } from '@/services/product-service/product.apis'
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, message, Popconfirm, Space, Table } from 'antd'
import Search from 'antd/es/input/Search'
import { useState } from 'react'
import { Link } from 'react-router'

const ProductPage = () => {
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })
  const queryClient = useQueryClient()

  const { data: listProducts, isLoading } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL, pagination.current, pagination.pageSize],
    queryFn: async () => {
      const params = `?current=${pagination.current}&pageSize=${pagination.pageSize}&sort=-createdAt`
      const res = await fetchAllProducts(params)
      if (res && res.data) {
        return res.data
      } else {
        message.error('Lấy danh sách sản phẩm thất bại!')
      }
    }
  })
  console.log('🚀 ~ ProductPage ~ listProducts:', listProducts)

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteProductAPI(id)
      if (res && res.data) {
        message.success('Xóa sản phẩm thành công!')
        return res.data
      } else {
        message.error('Xóa sản phẩm thất bại!')
      }
    },
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!')
      // Refetch the product list after deletion
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Xóa sản phẩm thất bại!')
    }
  })

  const handleDelete = (id: string) => {
    deleteProductMutation.mutate(id)
  }

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
          crossOrigin="anonymous"
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
      render: (price: number, product: IProduct) => {
        return <span>{product?.variants && product.variants.length > 0 ? product.variants[0].price : price}</span>
      }
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
        onChange={e => setSearchValue(e.target.value)}
        value={searchValue}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={listProducts?.results || []}
        loading={isLoading}
        pagination={{
          total: listProducts?.meta.total || 0,
          pageSize: listProducts?.meta.pageSize || 10,
          current: listProducts?.meta.current || 1,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: listProducts?.meta.total || 0 }),
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`
        }}
      />
    </div>
  )
}

export default ProductPage
