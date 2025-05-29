import { Form, Input, Typography, Button, Switch, Select } from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate } from 'react-router'

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
  category?: string
}

const FormBlogAdd = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Call API lấy danh mục
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

  const addBlogMutation = useMutation({
    mutationFn: async (values: IBlog) => {
      const { data } = await axios.post('/api/v1/blogs', {
        ...values,
        content
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      navigate('/blogs')
    }
  })

  const onFinish = async (values: IBlog) => {
    if (!content || content === '<p><br></p>') {
      return
    }
    // Kiểm tra slug đã tồn tại chưa
    try {
      const res = await axios.get('/api/v1/blogs')
      const blogs = res.data?.results || []
      const isExist = blogs.some((blog: any) => blog.slug === values.slug)
      if (isExist) {
        form.setFields([
          {
            name: 'slug',
            errors: ['Slug đã tồn tại, vui lòng chọn slug khác']
          }
        ])
        return
      }
      addBlogMutation.mutate(values)
    } catch (error) {
      form.setFields([
        {
          name: 'slug',
          errors: ['Không kiểm tra được slug']
        }
      ])
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang tạo bài viết</Title>
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
            loading={addBlogMutation.isLoading}
          >
            Tạo bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogAdd
