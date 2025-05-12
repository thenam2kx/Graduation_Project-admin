import React from 'react';
import { Button, Form, Input, message, Typography } from 'antd';

const {Title} = Typography

interface IBrand{
  name: string;

}
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const onFinish = (values:IBrand) => {
  console.log(values);
  message.success('Cập nhật thương hiệu thành công');
};
const BrandUpdate = () => {
  const [form] = Form.useForm();
  return(
  <>
    <Title level={3}>Cập nhật thương hiệu</Title>
  <Form
  form={form}
    {...layout}
    name="nest-messages"
    onFinish={onFinish}
    style={{ maxWidth: 600 }}
  >
    <Form.Item name={['user', 'name']} label="Tên" rules={[
      { required: true,message: 'Please input your name!' },
      {min:5,message: 'Name must be at least 5 characters long'},
    ]}>
      
      <Input />
    </Form.Item>
    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Cập nhật
      </Button>
    </Form.Item>
  </Form>
  </>
)};
export default BrandUpdate;