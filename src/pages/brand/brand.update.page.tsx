import React from 'react';
import { Button, Form, Input, message, Select, Typography } from 'antd';
interface IBrand{
  name: string;
  isPublic: boolean;
}
const BrandUpdate = () => {
  const {Title} = Typography;
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const onFinish = (values:IBrand) => {
    console.log(values);
    message.success('Cập nhật thương hiệu thành công');
  };
  const [form] = Form.useForm();
  return(
    <>
      <Title level={3}>Cập nhật thương hiệu</Title>
      <Form
        form={form}{...layout}
        name="nest-messages"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name={['name']} label="Tên" rules={[
          { required: true,message: 'Vui lòng không bỏ trống' },
          {min:5,message: 'Tối thiểu 5 ký tự'},
        ]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="isPublic"
          label="Hiển thị"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value={true}>Hiển thị</Select.Option>
            <Select.Option value={false}>Ẩn</Select.Option>
          </Select>
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