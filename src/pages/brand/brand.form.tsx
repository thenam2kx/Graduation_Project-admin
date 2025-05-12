import React from 'react';
import { Button, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router'; 

const {Title} = Typography

interface IBrand{
  name: string;

}
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const BrandForm = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const onFinish = (values:IBrand) => {
  console.log(values);
  message.success('Thêm thương hiệu thành công');
  nav('/brands')
};
  return(
  <>
    <Title level={3}>Thêm thương hiệu</Title>
  <Form
  form={form}
    {...layout}
    name="nest-messages"
    onFinish={onFinish}
    style={{ maxWidth: 600 }}
  >
    <Form.Item name={['user', 'name']} label="Tên" rules={[
      { required: true,message: 'Vui lòng không bỏ trống' },
      {min:5,message: 'Tối thiểu 5 ký tự'},
    ]}>
      
      <Input />
    </Form.Item>
    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Thêm 
      </Button>
    </Form.Item>
  </Form>
  </>
)};
export default BrandForm;