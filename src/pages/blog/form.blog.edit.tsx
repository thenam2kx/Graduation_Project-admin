import { Form, Input, Typography, Button, Switch, Select, message } from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate, useParams } from 'react-router'

const { Title } = Typography

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

interface IBlog {
  title: string
  slug: string
  content: string
  isPublic: boolean
  categoryBlogId?: string
}

const FormBlogEdit = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  // Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/v1/cateblog')
        setCategories(res.data.results || [])
      } catch (error) {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Lấy thông tin bài viết
  const { data: blogData, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/blogs/${id}`)
      return res.data?.results ?? {}
    },
    enabled: !!id
  })

  useEffect(() => {
    if (blogData) {
      form.setFieldsValue({
        title: blogData.title,
        slug: blogData.slug,
        categoryBlogId: blogData.categoryBlogId,
        isPublic: blogData.isPublic,
        content: blogData.content
      })
      setContent(blogData.content)
    }
  }, [blogData, form])

  const editBlogMutation = useMutation({
    mutationFn: async (values: IBlog) => {
      const { data } = await axios.patch(`/api/v1/blogs/${id}`, {
        ...values,
        content
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      message.success('Cập nhật bài viết thành công')
      navigate('/blogs')
    }
  })

  const onFinish = async (values: IBlog) => {
    if (!content || content === '<p><br></p>') {
      return
    }
    editBlogMutation.mutate({ ...values, content })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Chỉnh sửa bài viết</Title>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ margin: '0 auto' }}
        initialValues={{ isPublic: true }}
      >
        <Form.Item
          label='Tiêu đề'
          name='title'
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder='Nhập tiêu đề' />
        </Form.Item>

        <Form.Item
          label='Mô tả ngắn'
          name='slug'
          rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
        >
          <Input placeholder='Nhập mô tả ngắn' />
        </Form.Item>

        <Form.Item
          label='Danh mục'
          name='categoryBlogId'
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select
            placeholder='Chọn danh mục'
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat._id
            }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label='Nội dung'
          name='content'
          required
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ minHeight: 100, borderRadius: 6, marginBottom: 20, height: 200 }}
          />
        </Form.Item>

        <Form.Item
          label='Hiển thị công khai'
          name='isPublic'
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            style={{ marginTop: 16 }}
            loading={editBlogMutation.isLoading}
          >
            Cập nhật bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogEdit
