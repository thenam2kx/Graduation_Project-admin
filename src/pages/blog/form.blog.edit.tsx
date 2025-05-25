import { Form, Input, message, Typography, Button, Switch } from 'antd'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate, useParams } from 'react-router-dom'

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
  title: string,
  slug: string,
  content: string,
  isPublic: boolean
}

const FormEditBlog = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: blog, isLoading: loadingBlog } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/blogs/${id}`)
      return res.data.data
    },
    enabled: !!id
  })

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, body }: { id: string, body: { title: string, slug: string, content: string } }) =>
      axios.patch(`/api/v1/blogs/${id}`, body),
    onSuccess: () => {
      message.success('Cập nhật bài viết thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      navigate('/blogs')
    },
    onError: () => {
      message.error('Cập nhật thất bại')
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      axios.patch(`/api/v1/blogs/status/${id}`, { isPublic }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  useEffect(() => {
    if (blog) {
      form.setFieldsValue({
        title: blog.title,
        slug: blog.slug,
        isPublic: blog.isPublic
      })
      setContent(blog.content)
    }
  }, [blog, form])

  const onFinish = (values: IBlog) => {
    if (values.isPublic !== blog?.isPublic) {
      updateStatusMutation.mutate(values.isPublic)
    }
    updateBlogMutation.mutate({
      id: id!,
      body: {
        title: values.title,
        slug: values.slug,
        content: content
      }
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang sửa bài viết</Title>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Form.Item label='Tiêu đề' name='title' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder='Nhập tiêu đề' />
        </Form.Item>

        <Form.Item label='Mô tả ngắn' name='slug' rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}>
          <Input placeholder='Nhập mô tả ngắn' />
        </Form.Item>

        <Form.Item label='Nội dung'>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
            <ReactQuill
              theme='snow'
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ minHeight: 200 }}
            />
          </div>
        </Form.Item>

        <Form.Item label='Hiển thị công khai' name='isPublic' valuePropName='checked' initialValue={true}>
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' style={{ marginTop: 16 }} loading={loadingBlog}>
            Sửa bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormEditBlog
