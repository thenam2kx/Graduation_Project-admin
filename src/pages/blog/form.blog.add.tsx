import { Form, Input, message, Typography, Button } from 'antd'
import { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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
  image: string
}

const FormBlogAdd = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')

  const onFinish = (values: IBlog) => {
    const blog = {
      ...values,
      content: content
    }
    console.log('New blog', blog)
    message.success('Blog post created successfully!')
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang tạo bài viết</Title>
      <Form layout='vertical' form={form} onFinish={onFinish} style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item label='Tiêu đề' name='title' >
          <Input placeholder='Nhập tiêu đề' />
        </Form.Item>

        <Form.Item label='Mô tả ngắn' name='slug' >
          <Input placeholder='Nhập mô tả ngắn' />
        </Form.Item>

        <Form.Item label='Hình ảnh'>
          <Input type='text' disabled />
        </Form.Item>

        <Form.Item label='Nội dung'>
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ height: 300 }}
          />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' style ={{ marginBottom: '10px', marginLeft: '10px' }}>
            Tạo bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogAdd
