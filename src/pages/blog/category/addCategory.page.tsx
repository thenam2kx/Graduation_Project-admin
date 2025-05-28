/* eslint-disable no-console */
import { Form, Input, message, Typography, Button } from 'antd'
import { useNavigate } from 'react-router'
import axios from 'axios'

const { Title } = Typography

interface ICateblog {
  name: string
  slug: string
}

const FormCateBlogAdd = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values: ICateblog) => {
    try {
      await axios.post('http://localhost:8080/api/v1/cateblog', values)
      message.success('Danh mục bài viết được tạo thành công!')
      form.resetFields()
      navigate(-1)
    } catch (error) {
      message.error('Lỗi khi tạo danh mục bài viết, thử lại nhé!')
      console.error('API create cateblog error:', error)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang thêm danh mục bài viết</Title>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label='Tên danh mục'
          name='name'
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder='Nhập tên danh mục (vd: Tin tức công nghệ)' />
        </Form.Item>

        <Form.Item
          label='Slug'
          name='slug'
          rules={[{ required: true, message: 'Vui lòng nhập slug của danh mục!' }]}
        >
          <Input placeholder='Nhập slug (vd: tin-tuc-cong-nghe)' />
        </Form.Item>

        <Form.Item>
          <Button onClick={handleBack}>Quay lại</Button>
          <Button
            type='primary'
            htmlType='submit'
            style={{ marginLeft: 10 }}
          >
            Thêm danh mục
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormCateBlogAdd