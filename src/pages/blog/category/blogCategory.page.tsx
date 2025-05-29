/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import { Table, Button, Space, Popconfirm, message, Pagination } from 'antd'
import { Link } from 'react-router'

import axios from 'axios'
import Search from 'antd/es/input/Search'

const BlogCategoryPage = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/cateblog')
      setData(res.data.data?.results || [])
    } catch (err) {
      message.error('Lấy danh sách danh mục thất bại!')
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
      await axios.delete(`http://localhost:8080/api/v1/cateblog/${id}`)
      message.success('Xóa danh mục thành công!')
      fetchData()
    } catch (error) {
      message.error('Xóa danh mục thất bại!')
    }
  }

  const columns = [
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
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Link to={`/cateblog/edit/${record._id}`}>
            <Button type="primary">Sửa</Button>
          </Link>
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này không?"
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
      <h1>Trang danh mục bài viết</h1>
      <Link to="/cateblog/add">
        <Button type="primary" style={{ marginBottom: 16, float: 'right' }}>
          Thêm mới
        </Button>
      </Link>
      <Search
        placeholder="Tìm kiếm danh mục..."
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

export default BlogCategoryPage
