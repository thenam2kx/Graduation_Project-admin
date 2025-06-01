/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Table, Button, Space, Popconfirm, message, Pagination } from 'antd'
import { Link } from 'react-router'
import Search from 'antd/es/input/Search'

const ProductPage = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const sampleData = [
        {
          _id: '1',
          name: 'Nước hoa Dior Sauvage Eau de Parfum',
          description: 'Hương thơm nam tính, mạnh mẽ với nốt hương tiêu đen, ambroxan và vani, phù hợp cho buổi tối và mùa thu đông.',
          slug: 'dior-sauvage-eau-de-parfum',
          categoryId: 'vn-1',
          brandId: 'VietNam',
          price: 28990000,
          image: 'https://cdn.vuahanghieu.com/unsafe/0x500/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/product/2024/12/nuoc-hoa-nam-dior-sauvage-elixir-eau-de-parfum-100ml-67614857649b4-17122024164559.jpg',
          stock: 50,
          capacity: 128,
          discountId: 'dc-015',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
          deleted: false
        },
        {
          _id: '2',
          name: 'Chanel Coco Mademoiselle',
          description: 'Mùi hương quyến rũ, thanh lịch dành cho phái đẹp hiện đại, kết hợp giữa cam bergamot, hoa nhài và hoắc hương.',
          slug: 'chanel-coco-mademoiselle',
          categoryId: 'tl-2',
          brandId: 'ThaiLand',
          price: 32990000,
          image: 'https://tse3.mm.bing.net/th/id/OIP.LOVoLr8GE4runuqXpIDzqQAAAA?rs=1&pid=ImgDetMain',
          stock: 20,
          capacity: 512,
          discountId: 'dc-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
          deleted: false
        }
      ]
      setData(sampleData)
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
      setData(prev => prev.filter(item => item._id !== id))
      message.success('Xóa sản phẩm thành công!')
    } catch (error) {
      message.error('Xóa sản phẩm thất bại!')
    }
  }

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (url: string) => (
        <img src={url} alt="Ảnh sản phẩm" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}/>
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
      key: 'brandId'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId'
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
            <Button type="primary" danger>Xóa</Button>
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
        dataSource={Array.isArray(data) ? data : []}
        loading={loading}
        pagination={false}
      />
      <Pagination
        current={1}
        pageSize={5}
        total={data.length}
        style={{ marginTop: 16, textAlign: 'right' }}
      />
    </div>
  )
}

export default ProductPage