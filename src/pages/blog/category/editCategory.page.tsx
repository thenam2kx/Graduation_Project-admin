/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Form, Input, message, Typography, Button } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import axios from 'axios'

const { Title } = Typography

interface ICateblog {
  name: string
  slug: string
}

const FormCateBlogEdit = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8080/api/v1/cateblog/${id}`)
        form.setFieldsValue({
          name: data.data.name,
          slug: data.data.slug
        })
      } catch (error) {
        message.error('Lấy thông tin danh mục thất bại')
      }
    }
    fetchCategory()
  }, [id, form])

  const onFinish = async (values: ICateblog) => {
    try {
      await axios.patch(`http://localhost:8080/api/v1/cateblog/${id}`, values)
      message.success('Danh mục bài viết được chỉnh sửa thành công!')
      navigate('/cateblog')
    } catch (error) {
      message.error('Có lỗi khi lưu thay đổi, thử lại nha!')
    }
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
          <Button
            type='primary'
            htmlType='submit'
            style={{ marginBottom: '10px', marginLeft: '10px' }}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormCateBlogEdit