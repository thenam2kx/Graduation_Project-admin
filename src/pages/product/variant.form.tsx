import { fetchAllAttributes } from "@/services/product-service/attributes.apis"
import { ATTRIBUTE_QUERY_KEYS } from "@/services/product-service/product.key"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Col, Input, message, Row, Tag } from "antd"

const VariantForm = () => {
  const removeAttribute = (id: string) => {}

  const addAttribute = () => {}

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

  return (
    <Card size="small" title="Quản lý thuộc tính" className="bg-gray-50">
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {listAttributes && listAttributes?.map((attr) => (
            <Tag key={attr._id} closable onClose={() => removeAttribute(attr._id!)} className="px-3 py-1">
              {attr.name} ({attr.slug})
            </Tag>
          ))}
        </div>

        <Row gutter={8}>
          <Col span={8}>
            <Input
              placeholder="Tên thuộc tính"
              // value={newAttribute.name}
              // onChange={(e) => handleAttributeNameChange(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Input
              placeholder="Slug (tự động tạo)"
              // value={newAttribute.slug}
              // onChange={(e) => setNewAttribute({ ...newAttribute, slug: e.target.value })}
            />
          </Col>
          <Col span={8}>
            <Button onClick={addAttribute} type="dashed" className="w-full">
              Thêm thuộc tính
            </Button>
          </Col>
        </Row>
      </div>
    </Card>
  )
}

export default VariantForm
