import { Form, Input, Typography, Button, Row, Col, Select, InputNumber } from 'antd'
import { useNavigate } from 'react-router'

const { Title } = Typography

const FormProductEdit = () => {
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1)
  }
  const [form] = Form.useForm()

  const categories = [
    { _id: 'cat1', name: 'Nước hoa' },
    { _id: 'cat2', name: 'Mỹ phẩm' }
  ]
  const brands = [
    { _id: 'brand1', name: 'Brand A' },
    { _id: 'brand2', name: 'Brand B' }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Trang sửa thông tin sản phẩm</Title>
      <Form
        layout="vertical"
        form={form}
        style={{ maxWidth: 900, margin: '0 auto' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
              <Input placeholder="Nhập slug sản phẩm" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}>
              <Select placeholder="Chọn danh mục">
                {categories.map(cat => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Thương hiệu" name="brandId" rules={[{ required: true }]}>
              <Select placeholder="Chọn thương hiệu">
                {brands.map(brand => (
                  <Select.Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Giá" name="price" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập giá" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Tồn kho" name="stock" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập tồn kho" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Dung lượng (ML)" name="capacity" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập dung lượng" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Ảnh (URL)" name="image" rules={[{ required: true }]}>
              <Input placeholder="Nhập link ảnh sản phẩm" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mã giảm giá" name="discountId">
              <Input placeholder="Nhập mã giảm giá (nếu có)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button onClick={handleBack}>Quay lại</Button>
          <Button type="primary" style={{ marginLeft: 10 }}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormProductEdit