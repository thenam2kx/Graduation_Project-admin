import { Table, Button, Space, message, Switch, Input, Form } from 'antd'
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const navigate = useNavigate()

  // Fetch danh mục có phân trang và tìm kiếm
  const fetchList = async ({ page = 1, pageSize = 10, search = '' }) => {
    let url = `/api/v1/categories?current=${page}&pageSize=${pageSize}`
    if (search) {
      url += `&qs=${encodeURIComponent(search)}`
    }
    const res = await axios.get(url)
    setPagination(prev => ({
      ...prev,
      total: res.data?.data?.meta?.total || 0,
      current: res.data?.data?.meta?.current || 1,
      pageSize: res.data?.data?.meta?.pageSize || 10
    }))
    return {
      results: res.data?.data?.results || []
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
        <Space>
          <Button onClick={() => navigate(`/categories/edit/${record._id}`)}>Chỉnh sửa</Button>
          <Button danger>Xóa</Button>
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
