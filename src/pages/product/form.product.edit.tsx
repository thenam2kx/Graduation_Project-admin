import { Form, Input, Button, Select, InputNumber, Row, Col } from 'antd'
import { useNavigate } from 'react-router'

const FormProductAdd = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const categories = [
    { _id: 'cat1', name: 'Nước hoa' },
    { _id: 'cat2', name: 'Mỹ phẩm' }
  ]
  const brands = [
    { _id: 'brand1', name: 'Brand A' },
    { _id: 'brand2', name: 'Brand B' }
  ]

  const handleBack = () => {
    navigate(-1)
  }

  const onFinish = () => {
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Chỉnh sửa thông tin sản phẩm</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ width: '100%' }}
      >
        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Vui lòng nhập slug sản phẩm' }]}>
          <Input placeholder="Nhập slug sản phẩm" />
        </Form.Item>

        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
          <Select placeholder="Chọn danh mục">
            {categories.map(cat => (
              <Select.Option key={cat._id} value={cat._id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Thương hiệu" name="brandId" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
          <Select placeholder="Chọn thương hiệu">
            {brands.map(brand => (
              <Select.Option key={brand._id} value={brand._id}>
                {brand.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập giá" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Tồn kho" name="stock" rules={[{ required: true, message: 'Vui lòng nhập tồn kho' }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập tồn kho" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Dung lượng (ML)" name="capacity" rules={[{ required: true, message: 'Vui lòng nhập dung lượng' }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập dung lượng" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ảnh (URL)" name="image" rules={[{ required: true, message: 'Vui lòng nhập link ảnh sản phẩm' }]}>
          <Input placeholder="Nhập link ảnh sản phẩm" />
        </Form.Item>

        <Form.Item label="Mã giảm giá" name="discountId">
          <Input placeholder="Nhập mã giảm giá (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button onClick={handleBack}>Quay lại</Button>
          <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormProductAdd