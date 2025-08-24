import React, { useState } from 'react';
import { Button, Form, Input, message, Select, Typography } from 'antd';
import { useNavigate } from 'react-router';

// Function tạo slug
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space, dấu gạch
    .replace(/\s+/g, '-') // Thay space bằng dấu gạch
    .replace(/-+/g, '-') // Bỏ dấu gạch thừa
    .trim()
}

interface IBrand{
  name: string;
  slug?: string;
  isPublic: boolean;
}
const BrandForm = () => {
  const {Title} = Typography;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [currentSlug, setCurrentSlug] = useState('');
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  }
  
  const onFinish = (values:IBrand) => {
    console.log(values);
    message.success('Thêm thương hiệu thành công');
    nav('/brand')
  }

  // Xử lý khi thay đổi tên để tự động tạo slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
    
    if (name.trim()) {
      const newSlug = createSlug(name)
      setCurrentSlug(newSlug)
      form.setFieldValue('slug', newSlug)
    } else {
      setCurrentSlug('')
      form.setFieldValue('slug', '')
    }
  }

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
        <Form.Item name={['name']} label="Tên" rules={[
          { required: true,message: 'Vui lòng không bỏ trống' },
          {min:5,message: 'Tối thiểu 5 ký tự'}
        ]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        
        <Form.Item name={['slug']} label="Slug">
          <Input 
            placeholder="Slug tự động tạo từ tên" 
            value={currentSlug}
            disabled
            style={{ 
              backgroundColor: '#f5f5f5', 
              cursor: 'not-allowed',
              color: '#666'
            }}
          />
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
          <Button type="primary" htmlType="submit">Thêm</Button>
        </Form.Item>
      </Form>
    </>
  )}
export default BrandForm