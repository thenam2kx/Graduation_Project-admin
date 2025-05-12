import { Table, Image, Typography, Button, Space } from 'antd'
import { Link } from 'react-router'

const { Paragraph } = Typography

const BlogPage = () => {
  const dataSource = [
    {
      _id: '1e2d3c4b-5678-90ab-cdef-1234567890ab',
      title: 'Hướng dẫn React cơ bản',
      slug: 'huong-dan-react-co-ban',
      content: 'Đây là nội dung blog về hướng dẫn React cơ bản...',
      image: 'https://via.placeholder.com/300x200',
      createdAt: '2025-05-10T08:00:00Z',
      updatedAt: '2025-05-10T10:00:00Z',
      deletedAt: null,
      deleted: false
    },
    {
      _id: '2f3g4h5i-6789-01bc-defg-2345678901cd',
      title: 'Tìm hiểu về TypeScript',
      slug: 'tim-hieu-typescript',
      content: 'Bài viết này giới thiệu tổng quan về TypeScript...',
      image: 'https://via.placeholder.com/300x200',
      createdAt: '2025-05-09T09:00:00Z',
      updatedAt: '2025-05-09T11:30:00Z',
      deletedAt: null,
      deleted: false
    }
  ]

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug'
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (url: string) => <Image width={100} src={url} alt='blog image' />
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
      render: () => (
        <Space size='middle'>
          <Link to='/blogs/edit/1'>
            <Button type='primary'>Sửa</Button>
          </Link>
          <Button type='primary' danger>Xóa</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1>Blog Page</h1>
      <Link to='/blogs/add'>
      <Button type='primary' style={{ marginBottom: 16, float: 'right' }}>
        Thêm mới
      </Button>
      </Link>
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />
    </div>
  )
}

export default BlogPage
