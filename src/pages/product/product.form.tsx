import { useState } from "react"
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Card,
  Row,
  Col,
  message,
  Tag,
  Divider,
} from "antd"
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons"
import { convertSlugUrl } from "@/utils/utils"
import { useQuery } from "@tanstack/react-query"
import { fetchAllCategories } from "@/services/category-service/category.apis"
import { CATEGORY_QUERY_KEYS } from "@/services/category-service/category.key"
import { fetchAllBrandsAPI } from "@/services/brand-service/brand.apis"
import { BRAND_QUERY_KEYS } from "@/services/brand-service/brand.keys"
import { ATTRIBUTE_QUERY_KEYS } from "@/services/product-service/product.key"
import { fetchAllAttributes } from "@/services/product-service/attributes.apis"

const { TextArea } = Input
const { Option } = Select

export default function ProductCreator() {
  const [form] = Form.useForm()
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<IVariants[]>([])

  const { data: listCategories } = useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllCategories()
      if (res && res.data) {
        return res.data.results
      } else {
        message.error("Không thể lấy danh sách danh mục")
        return []
      }
    },
  })

  const { data: listBrands } = useQuery({
    queryKey: [BRAND_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllBrandsAPI()
      if (res && res.data) {
        return res.data.results
      } else {
        message.error("Không thể lấy danh sách thương hiệu")
        return []
      }
    },
  })

  const { data: listAttributes } = useQuery({
    queryKey: [ATTRIBUTE_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllAttributes()
      if (res && res.data) {
        return res.data.results
      } else {
        message.error("Không thể lấy danh sách thuộc tính")
        return []
      }
    },
  })

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Draft", value: "draft" },
    { label: "Out of Stock", value: "out_of_stock" },
  ]

  const addVariant = () => {
    const newVariant: IVariants = {
      _id: Date.now().toString(),
      sku: `SKU-${Date.now()}`,
      stock: 0,
      price: 0,
      image: "",
      attributes: [],
    }
    setVariants([...variants, newVariant])
  }

  const removeVariant = (id: string) => {
    setVariants(variants.filter((variant) => variant._id !== id))
  }

  const updateVariant = (id: string, field: keyof IVariants, value: any) => {
    setVariants(variants.map((variant) => (variant._id === id ? { ...variant, [field]: value } : variant)))
  }

  const updateVariantAttribute = (variantId: string, attributeId: string, value: string) => {
    setVariants(
      variants.map((variant) => {
        if (variant._id === variantId) {
          const existingAttrIndex = variant.attributes.findIndex((attr) => attr._id === attributeId)
          const selectedAttribute = listAttributes?.find((attr) => attr._id === attributeId)

          if (!selectedAttribute) return variant

          const newAttribute: IAttributes = {
            _id: attributeId,
            name: selectedAttribute.name,
            slug: convertSlugUrl(value),
          }

          if (existingAttrIndex >= 0) {
            const newAttributes = [...variant.attributes]
            newAttributes[existingAttrIndex] = newAttribute
            return { ...variant, attributes: newAttributes }
          } else {
            return { ...variant, attributes: [...variant.attributes, newAttribute] }
          }
        }
        return variant
      }),
    )
  }

  const removeVariantAttribute = (variantId: string, attributeId: string) => {
    setVariants(
      variants.map((variant) =>
        variant._id === variantId
          ? { ...variant, attributes: variant.attributes.filter((attr) => attr._id !== attributeId) }
          : variant,
      ),
    )
  }

  const onFinish = (values: any) => {
    const productData: IProductFormData = {
      ...values,
      variants: hasVariants ? variants : undefined,
    }

    console.log("Product Data:", productData)
    message.success("Product created successfully!")
  }


  const variantUploadProps = {
    name: "file",
    listType: "picture-card" as const,
    maxCount: 1,
    action: "/api/upload",
    onChange(info: any) {
      const { status } = info.file
      if (status === "done") {
        message.success(`Image uploaded successfully.`)
      } else if (status === "error") {
        message.error(`Image upload failed.`)
      }
    },
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6">
      <Card type="inner" title="Basic Information" className="mb-6">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
            >
              <Input placeholder="Nhập tên sản phẩm" size="large" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select placeholder="Chọn danh mục" size="large">
                {listCategories && listCategories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="brand" label="Thương hiệu">
              <Select placeholder="Chọn thương hiệu" size="large" allowClear>
                {listBrands && listBrands.map((brand) => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Giá ($)"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber min={0} step={0.01} placeholder="0.00" size="large" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="stock"
              label="Số lượng tồn kho"
              rules={[{ required: !hasVariants, message: "Vui lòng nhập số lượng tồn kho" }]}
            >
              <InputNumber min={0} placeholder="0" size="large" style={{ width: "100%" }} disabled={hasVariants} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Trạng thái" initialValue="active">
              <Select size="large">
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="images" label="Product Images">
          <Upload>
            <div className="flex flex-col items-center">
              <UploadOutlined className="text-2xl mb-2" />
              <div>Upload Images</div>
            </div>
          </Upload>
        </Form.Item>
      </Card>

      {/* Variants Section */}
      <Card type="inner" title="Biến thể sản phẩm" className="mb-6">
        {/* <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Kích hoạt biến thể sản phẩm</span>
            <Switch
              checked={hasVariants}
              onChange={(checked) => {
                setHasVariants(checked)
                if (!checked) {
                  setVariants([])
                }
              }}
            />
          </div>
        </div> */}

        <div className="space-y-6">
          {/* Attribute Management */}
          {/* <Card size="small" title="Quản lý thuộc tính" className="bg-gray-50">
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {availableAttributes.map((attr) => (
                  <Tag key={attr._id} closable onClose={() => removeAttribute(attr._id!)} className="px-3 py-1">
                    {attr.name} ({attr.slug})
                  </Tag>
                ))}
              </div>

              <Row gutter={8}>
                <Col span={8}>
                  <Input
                    placeholder="Tên thuộc tính"
                    value={newAttribute.name}
                    onChange={(e) => handleAttributeNameChange(e.target.value)}
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder="Slug (tự động tạo)"
                    value={newAttribute.slug}
                    onChange={(e) => setNewAttribute({ ...newAttribute, slug: e.target.value })}
                  />
                </Col>
                <Col span={8}>
                  <Button onClick={addAttribute} type="dashed" className="w-full">
                    Thêm thuộc tính
                  </Button>
                </Col>
              </Row>
            </div>
          </Card> */}

          {/* Variants List */}
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <Card
                key={variant._id}
                size="small"
                title={`Biến thể ${index + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeVariant(variant._id!)}
                  >
                    Xóa
                  </Button>
                }
                className="border-l-4 border-l-blue-500"
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">SKU *</label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant._id!, "sku", e.target.value)}
                        placeholder="Mã SKU"
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Giá ($) *</label>
                      <InputNumber
                        min={0}
                        step={0.01}
                        value={variant.price}
                        onChange={(value) => updateVariant(variant._id!, "price", value || 0)}
                        placeholder="0.00"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Số lượng tồn kho *</label>
                      <InputNumber
                        min={0}
                        value={variant.stock}
                        onChange={(value) => updateVariant(variant._id!, "stock", value || 0)}
                        placeholder="Số lượng tồn kho"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Variant Image</label>
                      <Upload {...variantUploadProps}>
                        <Button icon={<UploadOutlined />} size="small">
                          Tải lên
                        </Button>
                      </Upload>
                    </div>
                  </Col>
                </Row>

                <Divider orientation="left" orientationMargin="0">
                  <span className="text-sm">Attributes</span>
                </Divider>

                <div className="space-y-3">
                  {listAttributes && listAttributes?.length > 0 && listAttributes.map((attr) => {
                    const variantAttr = variant.attributes.find((va) => va._id === attr._id)
                    return (
                      <Row key={attr._id} gutter={8} align="middle">
                        <Col span={6}>
                          <span className="text-sm font-medium">{attr.name}:</span>
                        </Col>
                        <Col span={12}>
                          <Input
                            placeholder={`Nhập ${attr.name.toLowerCase()}`}
                            value={variantAttr?.name || ""}
                            onChange={(e) => updateVariantAttribute(variant._id!, attr._id!, e.target.value)}
                          />
                        </Col>
                        <Col span={6}>
                          <span className="text-xs text-gray-500">
                            Slug: {variantAttr?.slug || "auto-generated"}
                          </span>
                          {variantAttr && (
                            <Button
                              type="text"
                              size="small"
                              danger
                              onClick={() => removeVariantAttribute(variant._id!, attr._id!)}
                            >
                              Xóa
                            </Button>
                          )}
                        </Col>
                      </Row>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>

          <Button
            type="dashed"
            onClick={addVariant}
            icon={<PlusOutlined />}
            className="w-full h-12 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
          >
            Thêm biến thể mới
          </Button>
        </div>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-5 pt-6">
        <Button size="large" onClick={() => form.resetFields()}>
          Đặt lại
        </Button>
        <Button type="primary" htmlType="submit" size="large" className="px-8">
          Tạo sản phẩm
        </Button>
      </div>
    </Form>
  )
}
