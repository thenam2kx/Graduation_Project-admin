import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Image,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { convertSlugUrl } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategories } from "@/services/category-service/category.apis";
import { CATEGORY_QUERY_KEYS } from "@/services/category-service/category.key";
import { fetchAllBrandsAPI } from "@/services/brand-service/brand.apis";
import { BRAND_QUERY_KEYS } from "@/services/brand-service/brand.keys";
import { ATTRIBUTE_QUERY_KEYS } from "@/services/product-service/product.key";
import { fetchAllAttributes } from "@/services/product-service/attributes.apis";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setIsOpenModalUpload } from "@/redux/slices/media.slice";
import Editor from "@/components/editor";

const { Option } = Select;

interface IVariants {
  _id?: string;
  sku: string;
  stock: number;
  price: number;
  image: string;
  attributes: { _id: string; name: string; slug: string; value: string }[];
}

interface IProps {
  onSubmit?: (data: any) => void;
  productData?: any; // Dữ liệu sản phẩm hiện có
}

const ProductFormUpdate = (props: IProps) => {
  const { onSubmit, productData } = props;
  const [form] = Form.useForm();
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [variants, setVariants] = useState<IVariants[]>([]);
  const [description, setDescription] = useState<string>("")
  const dispatch = useAppDispatch();
  const selectedMedia = useAppSelector((state) => state.media.selectedMedia);

  // Fetch danh sách danh mục, thương hiệu và thuộc tính
  const { data: listCategories } = useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllCategories();
      return res?.data?.results || [];
    },
  });

  const { data: listBrands } = useQuery({
    queryKey: [BRAND_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllBrandsAPI();
      return res?.data?.results || [];
    },
  });

  const { data: listAttributes } = useQuery({
    queryKey: [ATTRIBUTE_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchAllAttributes();
      return res?.data?.results || [];
    },
  });

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Draft", value: "draft" },
    { label: "Out of Stock", value: "out_of_stock" },
  ];

  // Điền dữ liệu sản phẩm hiện có vào form khi component mount
  useEffect(() => {
    if (productData) {
      form.setFieldsValue({
        name: productData.name,
        category: productData.categoryId?._id,
        brand: productData.brandId?._id,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        status: productData.status || "active",
      });
      setDescription(productData.description || "");

      const hasExistingVariants = productData.variants && productData.variants.length > 0;
      setHasVariants(hasExistingVariants);
      if (hasExistingVariants) {
        setVariants(mapVariants(productData.variants));
      }
      // dispatch(setSelectedMedia(productData.image?.[0] || ""));
    }
  }, [productData, form]);

  // Hàm ánh xạ variants từ dữ liệu đầu vào
  const mapVariants = (variants: any[]) => {
    return variants.map((variant) => ({
      _id: variant._id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      image: variant.image,
      attributes: variant.variant_attributes.map((attr: any) => ({
        _id: attr.attributeId._id,
        name: attr.value,
        slug: attr.attributeId.slug,
        value: attr.value,
      })),
    }));
  };

  const addVariant = () => {
    const newVariant: IVariants = {
      _id: Date.now().toString(),
      sku: `SKU-${Date.now()}`,
      stock: 0,
      price: 0,
      image: "",
      attributes: [],
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof IVariants, value: any) => {
    setVariants(
      variants.map((variant) =>
        variant._id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const updateVariantAttribute = (variantId: string, attributeId: string, value: string) => {
    const trimmedValue = value.trim();
    setVariants(
      variants.map((variant) =>
        variant._id === variantId
          ? {
              ...variant,
              attributes: trimmedValue
                ? variant.attributes.some((attr) => attr._id === attributeId)
                  ? variant.attributes.map((attr) =>
                      attr._id === attributeId
                        ? { ...attr, name: trimmedValue, slug: convertSlugUrl(trimmedValue), value: trimmedValue }
                        : attr
                    )
                  : [
                      ...variant.attributes,
                      { _id: attributeId, name: trimmedValue, slug: convertSlugUrl(trimmedValue), value: trimmedValue },
                    ]
                : variant.attributes.filter((attr) => attr._id !== attributeId),
            }
          : variant
      )
    );
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((variant) => variant._id !== id));
  };

  const removeVariantAttribute = (variantId: string, attributeId: string) => {
    setVariants(
      variants.map((variant) =>
        variant._id === variantId
          ? { ...variant, attributes: variant.attributes.filter((attr) => attr._id !== attributeId) }
          : variant
      )
    );
  };

  const onFinish = (values: any) => {
    const slug = convertSlugUrl(values.name);
    const images = selectedMedia
      ? [`http://localhost:8080${selectedMedia}`]
      : productData?.image || [];

    const productUpdateData = {
      name: values.name,
      slug: slug,
      price: hasVariants ? undefined : values.price,
      description: values.description,
      categoryId: values.category,
      brandId: values.brand,
      image: images,
      stock: hasVariants ? undefined : values.stock,
      capacity: values.capacity || 0,
      variants: hasVariants
        ? variants.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            image: variant.image,
            attributes: variant.attributes.map((attr) => ({
              attributeId: attr._id,
              value: attr.value,
            })),
          }))
        : undefined,
    };

    onSubmit && onSubmit(productUpdateData);
    console.log('🚀 ~ onFinish ~ productUpdateData:', productUpdateData)
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-6"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        {selectedMedia || productData?.image?.[0] ? (
            <Image
              width={200}
              src={
                selectedMedia?.startsWith("http")
                  ? selectedMedia
                  : productData?.image?.[0] || `http://localhost:8080${selectedMedia}`
              }
              crossOrigin="anonymous"
            />
        ) : null}
        </div>
      <Button
        type="primary"
        style={{ marginTop: 4 }}
        onClick={() => dispatch(setIsOpenModalUpload(true))}
      >
        {selectedMedia || productData?.image?.[0] ? "Sửa ảnh" : "Chọn ảnh"}
      </Button>
      <Card
        type="inner"
        title="Thông tin cơ bản"
        className="mb-6"
        extra={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Biến thể</span>
            <Switch
              checked={hasVariants}
              onChange={(checked) => {
                setHasVariants(checked);
                if (!checked) setVariants([]);
              }}
            />
          </div>
        }
      >
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
                {listCategories?.map((category) => (
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
                {listBrands?.map((brand) => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Giá ($)"
              rules={[{ required: !hasVariants, message: "Vui lòng nhập giá" }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="0.00"
                size="large"
                disabled={hasVariants}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="stock"
              label="Số lượng tồn kho"
              rules={[{ required: !hasVariants, message: "Vui lòng nhập số lượng tồn kho" }]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                size="large"
                style={{ width: "100%" }}
                disabled={hasVariants}
              />
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

        <Form.Item name="description" label="Mô tả">
          <Editor onChange={setDescription} value={description} />
        </Form.Item>
      </Card>

      {hasVariants && (
        <Card type="inner" title="Biến thể sản phẩm" className="mb-6">
          <div className="space-y-6">
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
                      <div className="flex flex-col items-center justify-center h-full">
                        <Image
                          width={100}
                          src={variant.image || "https://via.placeholder.com/100"}
                          crossOrigin="anonymous"
                        />
                        <Button
                          type="primary"
                          style={{ marginTop: 4 }}
                          onClick={() => dispatch(setIsOpenModalUpload(true))}
                        >
                          {variant.image ? "Sửa ảnh" : "Chọn ảnh"}
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  <Divider orientation="left" orientationMargin="0">
                    <span className="text-sm">Thuộc tính</span>
                  </Divider>

                  <div className="space-y-3">
                    {listAttributes?.map((attr) => {
                      const variantAttr = variant.attributes.find((va) => va._id === attr._id);
                      return (
                        <Row key={attr._id} gutter={8} align="middle">
                          <Col span={6}>
                            <span className="text-sm font-medium">{attr.name}:</span>
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder={`Nhập ${attr.name.toLowerCase()}`}
                              value={variantAttr?.value || ""}
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
                      );
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
      )}

      <div className="flex justify-end gap-5 pt-6">
        <Button size="large" onClick={() => form.resetFields()}>
          Đặt lại
        </Button>
        <Button type="primary" htmlType="submit" size="large" className="px-8">
          Cập nhật sản phẩm
        </Button>
      </div>
    </Form>
  );
};

export default ProductFormUpdate;
