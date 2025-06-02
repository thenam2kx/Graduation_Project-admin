import { Button, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { useState } from 'react'

interface ICateblog {
  name: string
  slug: string
}

const FormCateBlogAdd = () => {
  const [form] = Form.useForm<ICateblog>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: ICateblog) => {
    setLoading(true)
    try {
      await axios.post('http://localhost:8080/api/v1/cateblog', values)
      message.success('Danh mục bài viết được tạo thành công!')
      form.resetFields()
      navigate(-1)
    } catch (error) {
      message.error('Lỗi khi tạo danh mục bài viết, thử lại nhé!')
      console.error('API create cateblog error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Thêm danh mục bài viết</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ width: '100%' }}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder="Nhập tên danh mục (vd: Tin tức công nghệ)" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: 'Vui lòng nhập slug của danh mục!' }]}
        >
          <Input placeholder="Nhập slug (vd: tin-tuc-cong-nghe)" />
        </Form.Item>

        <Form.Item>
          <Button onClick={handleBack}>Quay lại</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ marginLeft: 10 }}
          >
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormCateBlogAdd