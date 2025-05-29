import { Table, Button, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import type { ColumnsType } from 'antd/es/table'

interface Category {
  key: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  status: boolean;
}

const CategoryList = () => {
  const navigate = useNavigate()

  const dataSource: Category[] = [
    {
      key: '1',
      name: 'Nước hoa nam',
      slug: 'nuoc-hoa-nam',
      description: 'Các dòng nước hoa dành cho nam giới',
      image: 'https://picsum.photos/50',
      order: 1,
      status: true
    },
    {
      key: '2',
      name: 'Nước hoa nữ',
      slug: 'nuoc-hoa-nu',
      description: 'Các dòng nước hoa dành cho nữ giới',
      image: 'https://picsum.photos/50',
      order: 2,
      status: false
    }
  ]

  const columns: ColumnsType<Category> = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) => <img src={src} alt="Ảnh" width={50} height={50} />
    },
    { title: 'Thứ tự', dataIndex: 'order', key: 'order' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? 'Hiển thị' : 'Ẩn'}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/categories/edit/${record.key}`)}>Chỉnh sửa</Button>
          <Button danger>Xóa</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2>Danh sách danh mục</h2>
      <Button type="primary" onClick={() => navigate('/categories/add')}>Thêm danh mục</Button>
      <Table style={{ marginTop: 16 }} dataSource={dataSource} columns={columns} rowKey="key" />
    </div>
  )
}

export default CategoryList
