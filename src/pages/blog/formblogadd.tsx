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

const FormBlogAdd = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const onFinish = (values: any) => {
    const blog = {
      ...values,
      content: content,
      image: imageUrl
    }
    console.log('New blog', blog)
    message.success('Blog post created successfully!')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Form Blog</Title>
      <Form layout='vertical' form={form} onFinish={onFinish} style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form.Item label='Title' name='title' >
          <Input placeholder='Title' />
        </Form.Item>

        <Form.Item label='Slug' name='slug' >
          <Input placeholder='Slug' />
        </Form.Item>

        <Form.Item label='Image'>
          <Input type='file' onChange={handleImageUpload} />
        </Form.Item>

        <Form.Item label='Content'>
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
            Create Blog
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogAdd
