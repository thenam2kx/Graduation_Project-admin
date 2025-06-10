import { Table, Button, Space, message, Switch, Input, Form, Modal, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import axios from '@/config/axios.customize'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  isPublic: boolean
}

const CategoryList = () => {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const navigate = useNavigate()

  // Fetch danh mục có phân trang và tìm kiếm
  const fetchList = async ({ page = 1, pageSize = 5, search = '' }) => {
    let url = `/api/v1/categories?current=${page}&pageSize=${pageSize}`
    if (search) {
      url += `&qs=${encodeURIComponent(search)}`
    }
    const res = await axios.get(url)
    setPagination(prev => ({
      ...prev,
      total: res.data?.meta?.total || 0,
      current: res.data?.meta?.current || 1,
      pageSize: res.data?.meta?.pageSize || 10
    }))
    return {
      results: res.data?.results || []
    }
  }


  const { data, isLoading } = useQuery({
    queryKey: ['categories', pagination.current, pagination.pageSize, searchText],
    queryFn: () => fetchList({ page: pagination.current, pageSize: pagination.pageSize, search: searchText }),
    keepPreviousData: true
  })

  const statusMutation = useMutation({
    mutationFn: (variables: { id: string, isPublic: boolean }) =>
      axios.patch(`/api/v1/categories/${variables.id}`, { isPublic: variables.isPublic }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  // Hàm xóa danh mục
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/categories/${id}`),
    onSuccess: () => {
      message.success('Xóa danh mục thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      message.error('Xóa danh mục thất bại')
    }
  })

  const showDeleteConfirm = (record: Category) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(record._id)
    })
  }

  const columns: ColumnsType<Category> = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (_: boolean, record: Category) => (
        <Switch
          checked={record.isPublic}
          onChange={checked => statusMutation.mutate({ id: record._id, isPublic: checked })}
          checkedChildren="Hiển thị"
          unCheckedChildren="Ẩn"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/categories/edit/${record._id}`)}
              className="text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500"
            />
          </Tooltip>
          <Tooltip title="Xóa danh mục">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              className="text-red-600 border-red-600 hover:text-red-500 hover:border-red-500"
            />
          </Tooltip>
        </Space>
      )
    }
  ]


  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách danh mục</h2>
      <Button type="primary" style={{ marginBottom: 16, float: 'right' }} onClick={() => navigate('/categories/add')}>
        Thêm danh mục
      </Button>
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item>
          <Input
            placeholder="Tìm kiếm tên danh mục"
            value={searchText}
            onChange={e => {
              setPagination(prev => ({ ...prev, current: 1 }))
              setSearchText(e.target.value)
            }}
            allowClear
          />
        </Form.Item>
      </Form>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data?.results || []} // Sửa dòng này
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
          showSizeChanger: true
        }}
        loading={isLoading}
      />
    </div>
  )
}

export default CategoryList
