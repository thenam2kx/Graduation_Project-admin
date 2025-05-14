import { Table, Button, Space } from 'antd'
import { Link } from 'react-router'

const BlogCategoryPage = () => {
  const dataSource = [
    {
      _id: '1a2b3c4d-5678-90ab-cdef-1234567890ab',
      name: 'Học lập trình',
      slug: 'hoc-lap-trinh',
      createdAt: '2025-05-10T08:00:00Z',
      updatedAt: '2025-05-10T10:00:00Z',
      deletedAt: null,
      deleted: false
    },
    {
      _id: '2b3c4d5e-6789-01bc-defg-2345678901cd',
      name: 'Công nghệ mới',
      slug: 'cong-nghe-moi',
      createdAt: '2025-05-09T09:00:00Z',
      updatedAt: '2025-05-09T11:30:00Z',
      deletedAt: null,
      deleted: false
    }
  ]

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex:'name',
      key: 'name'
    },
    {
      title: 'Slug',
      dataIndex:'slug',
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
      render: () => (
        <Space size='middle'>
          <Link to='/cateblog/edit/1'>
            <Button type='primary'>Sửa</Button>
          </Link>
          <Button type='primary' danger>Xóa</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang danh mục bài viết</h1>
      <Link to='/cateblog/add'>
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

export default BlogCategoryPage