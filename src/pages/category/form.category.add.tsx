import { Button, Form, Input, InputNumber, Switch, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

interface ICategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  status: boolean;
}

const CategoryAdd = () => {
  const [form] = Form.useForm<ICategory>()

  const onFinish = (values: ICategory) => {
    console.log('Thêm danh mục:', values)
    message.success('Thêm thành công!')
    form.resetFields()
  }

  return (
    <div>
      <h2>Thêm danh mục</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: true, order: 0 }}>
        <Form.Item label="Tên danh mục" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>
        <Form.Item label="Slug" name="slug"rules={[{ required: true, message: 'Vui lòng nhập slug danh mục' }]}>
          <Input placeholder="nhap-slug-tu-dong" />
        </Form.Item>
        <Form.Item label="Ảnh đại diện" name="image"rules={[{ required: true, message: 'Vui lòng thêm ảnh danh mục' }]}>
          <Upload name="image" listType="picture" maxCount={1}>
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Thứ tự hiển thị" name="order">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label="Hiển thị" name="isActive" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
        <Button type="primary" htmlType="submit">Thêm mới</Button>
      </Form>
    </div>
  )
}

export default CategoryAdd
