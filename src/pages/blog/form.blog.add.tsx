import { Form, Input, message, Typography, Button, Switch } from 'antd'
import { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate } from 'react-router-dom'

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

const FormBlogAdd = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newBlog: IBlog) => {
      const res = await axios.post('/api/v1/blogs', newBlog)
      return res.data.data
    },
    onSuccess: () => {
      message.success('Tạo bài viết thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      navigate('/blogs')
    },
    onError: () => {
      message.error('Tạo bài viết thất bại')
    }
  })

  const onFinish = (values: IBlog) => {
    const blog = {
      ...values,
      content: content
    }
    mutation.mutate(blog)
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang tạo bài viết</Title>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
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

        <Form.Item
          label='Hiển thị công khai'
          name='isPublic'
          valuePropName='checked'
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' style={{ marginTop: 16 }}>
            Tạo bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogAdd
