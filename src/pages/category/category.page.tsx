import { Table, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

const CategoryList = () => {
  const navigate = useNavigate()

  const dataSource = [
    { key: '1', name: 'Nước hoa nam' },
    { key: '2', name: 'Nước hoa nữ' }
  ]

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record: any) => (
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
      <Table style={{ marginTop: 16 }} dataSource={dataSource} columns={columns} />
    </div>
  )
}

export default CategoryList
