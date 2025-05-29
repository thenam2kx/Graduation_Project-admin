import axios from '@/config/axios.customize'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Button, Space, Switch, Modal, message, Form, Input } from 'antd'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'

const { Paragraph } = Typography

const BlogPage = () => {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])

  // Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get('/api/v1/cateblog')
      setCategories(res.data?.results || [])
    }
    fetchCategories()
  }, [])

  // Thêm searchText vào queryKey để refetch khi search
  const fetchList = async () => {
    let url = '/api/v1/blogs'
    if (searchText) {
      url += `?qs=${encodeURIComponent(searchText)}`
    }
    const res = await axios.get(url)
    return res.data.results
  }

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', searchText],
    queryFn: fetchList,
    refetchOnWindowFocus: false
  })

  const statusMutation = useMutation({
    mutationFn: (variables: { id: string, isPublic: boolean }) =>
      axios.patch(`/api/v1/blogs/status/${variables.id}`, { isPublic: variables.isPublic }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/blogs/${id}`),
    onSuccess: () => {
      message.success('Xóa bài viết thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => {
      message.error('Xóa thất bại')
    }
  })

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài viết này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(id)
    })
  }

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
      title: 'Danh mục',
      dataIndex: 'categoryBlogId',
      key: 'categoryBlogId',
      filters: categories.map((cat) => ({
        text: cat.name,
        value: cat._id
      })),
      onFilter: (value, record) => record.categoryBlogId === value,
      render: (categoryBlogId: string) => {
        const cat = categories.find((c) => c._id === categoryBlogId)
        return cat ? cat.name : 'Bài viết không có danh mục'
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (_: any, record: any) => (
        <Switch
          checked={record.isPublic}
          onChange={(checked) =>
            statusMutation.mutate({ id: record._id, isPublic: checked })
          }
          checkedChildren='Hiện'
          unCheckedChildren='Ẩn'
        />
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size='middle'>
          <Link to={`/blogs/edit/${record._id}`}>
            <Button type='primary'>Sửa</Button>
          </Link>
          <Button type='primary' danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang bài viết</h1>
      <Link to='/blogs/add'>
        <Button type='primary' style={{ marginBottom: 16, float: 'right' }}>
          Thêm mới
        </Button>
      </Link>
      <Space style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item>
            <Input
              placeholder="Tìm kiếm tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Space>
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        loading={isLoading}
      />
    </div>
  )
}

export default BlogPage
