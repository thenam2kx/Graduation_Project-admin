/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Row,
  Col,
  message,
  Spin
} from 'antd'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'

interface ProductFormValues {
  name: string
  description: string
  slug: string
  categoryId: string
  brandId: string
  price: number
  stock: number
  capacity: number
  image: string
}

interface Category {
  _id: string
  name: string
}

interface Brand {
  _id: string
  name: string
}

const FormProductEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true)
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/categories'),
          axios.get('http://localhost:8080/api/v1/brand')
        ])
        setCategories(catRes.data.data?.results || catRes.data.results || [])
        setBrands(brandRes.data.data?.results || brandRes.data.results || [])
      } catch {
        message.error('Lỗi khi lấy danh mục hoặc thương hiệu')
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      setLoadingData(true)
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/products/${id}`)
        const product = res.data.data || res.data

        form.setFieldsValue({
          name: product.name || '',
          description: product.description || '',
          slug: product.slug || '',
          categoryId: typeof product.categoryId === 'string'
            ? product.categoryId
            : product.categoryId?._id || undefined,
          brandId: typeof product.brandId === 'string'
            ? product.brandId
            : product.brandId?._id || undefined,
          price: product.price || 0,
          stock: product.stock || 0,
          capacity: product.capacity || 0,
          image: product.image || ''
        })
      } catch {
        message.error('Lỗi khi tải dữ liệu sản phẩm')
      } finally {
        setLoadingData(false)
      }
    }
    fetchProduct()
  }, [id, form])

  const handleBack = () => {
    navigate(-1)
  }

  const onFinish = async (values: ProductFormValues) => {
    if (!id) return
    setLoading(true)
    try {
      await axios.patch(`http://localhost:8080/api/v1/products/${id}`, values)
      message.success('Cập nhật sản phẩm thành công!')
      navigate(-1)
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Cập nhật sản phẩm thất bại, vui lòng kiểm tra dữ liệu'
      message.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Chỉnh sửa sản phẩm</h2>
      <Spin spinning={fetching || loadingData} tip="Đang tải dữ liệu...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ width: '100%', marginTop: 20 }}
        >
          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item label="Mô tả sản phẩm" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm' }]}>
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
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

          <Form.Item>
            <Button onClick={handleBack} disabled={loading}>
              Quay lại
            </Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }} loading={loading}>
              Cập nhật sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  )
}

export default FormProductEdit
