import instance from "@/config/axios.customize";
import { IDiscounts } from "@/types/discounts";
import { useQuery } from "@tanstack/react-query";
import { Col, DatePicker, Input, message, Row, Select, Form, Button, Typography, Divider } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import Card from "antd/es/card/Card";

const { Title } = Typography;

const DiscountsUpdate = () => {
  const options = [
  { label: 'Nước gucci', value: 'Nước hoa gucci' },
  { label: 'Nước chanel', value: 'Nước hoa chanel' },
  { label: 'Son môi', value: 'Son môi' },
];
  const cate = [
  { label: 'Nước hoa nam', value: 'Nước hoa nam' },
  { label: 'Nước hoa nữ ', value: 'Nước hoa nữ' },
  { label: 'Son môi', value: 'Son môi' },
];
  const variants = [
  { label: '100ml', value: '100ml' },
  { label: '150ml ', value: '150ml' },
  { label: '200ml', value: '200ml' },
];
  const {id} = useParams()
  const [form] = Form.useForm()
  const {data} = useQuery({
    queryKey:['discounts',id],
    queryFn: async()=>{
      try {
      const res = await instance.get(`/api/v1/discounts/${id}`);
      return res.data;
      } catch (error) {
        console.log(error);
      }
    }
  })
   useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        startDate: data.startDate ? dayjs(data.startDate) : null,
        endDate: data.endDate ? dayjs(data.endDate) : null,
      });
    }
  }, [data, form]);
  const nav = useNavigate()

 const handleFinish = async (values: IDiscounts) => {
  try {
    const now = dayjs(); 
    const { startDate, endDate } = values;

    let status = "Sắp diễn ra";
    if (startDate && endDate) {
      if (now.isBefore(startDate)) {
        status = "Sắp diễn ra";
      } else if (now.isAfter(endDate)) {
        status = "Đã kết thúc";
      } else {
        status = "Đang diễn ra";
      }
    }

    const payload = {
      ...values,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      status,
    };

    await instance.patch(`/api/v1/discounts/${id}`, payload);
    message.success("Sửa mã giảm giá thành công");
    nav("/discounts");
  } catch (err: any) {
  console.error(err);
    const errMessage = err.response?.data?.message || "Lỗi khi thêm mã giảm giá";
    message.error(errMessage);
  }
};

  return (
    <div className="p-4">
      <Card >
        <Title level={4}>Sửa mã giảm giá</Title>

        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Row gutter={24}>
            {/* Cột trái */}
            <Col span={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <Input placeholder="Mã code" />
              </Form.Item>

              <Form.Item
                label="Kiểu giảm giá"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
              >
                <Select placeholder="Chọn kiểu giảm giá">
                  <Select.Option value="%">%</Select.Option>
                  <Select.Option value="Vnd">Vnđ</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Giá trị giảm"
                name="value"
                rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
              >
                <Input className="w-full" min={0} placeholder="Giá trị giảm" />
              </Form.Item>

              <Form.Item label="Giảm tối đa" name="max_discount_amount">
                <Input className="w-full" min={0} placeholder="Giảm tối đa" />
              </Form.Item>

              <Form.Item label="Giá trị đơn hàng tối thiểu" name="min_order_value">
                <Input className="w-full" min={0} placeholder="Giá trị tối thiểu" />
              </Form.Item>

              <Form.Item label="Giới hạn toàn hệ thống" name="usage_limit">
                <Input className="w-full" min={100} placeholder="Giới hạn sử dụng" />
              </Form.Item>
            </Col>

            {/* Cột phải */}
            <Col span={12}>
              <Form.Item label="Sản phẩm áp dụng" name="applies_product">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Tên sản phẩm"
              options={options}
            />
          </Form.Item>
              <Form.Item label="Danh mục áp dụng" name="applies_category">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Tên danh mục"
              options={cate}
            />
          </Form.Item>

          <Form.Item label="Biến thể áp dụng" name="applies_variant">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Tên biến thể"
              options={variants}
            />
          </Form.Item>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item label="Giới hạn mỗi người dùng" name="usage_per_user">
                <Input className="w-full" min={1} placeholder="Mỗi người dùng" />
              </Form.Item>
            </Col>
          </Row>

          {/* Mô tả toàn chiều rộng */}
          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <TextArea rows={4} placeholder="Mô tả chi tiết..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Nút hành động canh giữa */}
          <Row justify="center">
            <Col>
              <Form.Item>
                <div className="flex gap-4">
                  <Button htmlType="submit" type="primary">
                    Sửa
                  </Button>
                  <Button onClick={() => nav("/discounts")}>Hủy</Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default DiscountsUpdate;
