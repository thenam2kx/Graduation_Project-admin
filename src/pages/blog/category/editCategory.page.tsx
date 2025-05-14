/* eslint-disable no-console */
import { Form, Input, message, Typography, Button } from 'antd'
import { useNavigate } from 'react-router'

const { Title } = Typography

interface ICateblog {
  name: string
  slug: string
}

const FormCateBlogEdit = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = (values: ICateblog) => {
    console.log('New category', values)
    message.success('Danh mục bài viết được chỉnh sửa thành công!')
  }
  const handleBack = () => {
    navigate(-1)
  }
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang chỉnh sửa thông tin danh mục bài viết</Title>
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
          <Button type='primary' htmlType='submit' style={{ marginBottom: '10px', marginLeft: '10px' }}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormCateBlogEdit
