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

  const { id } = useParams();
  const [form] = Form.useForm();
  const nav = useNavigate();
  const { data } = useQuery({
    queryKey: ["discounts", id],
    queryFn: async () => {
      const res = await instance.get(`/api/v1/discounts/${id}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        startDate: data.startDate ? dayjs(data.startDate) : null,
        endDate: data.endDate ? dayjs(data.endDate) : null,

      });
    }
  }, [data, form]);

  const handleFinish = async (values: IDiscounts) => {
    try {
      const payload = {
        ...values,
        startDate: values.startDate?.toISOString() || null,
        endDate: values.endDate?.toISOString() || null,
      };

      await instance.patch(`/api/v1/discounts/${id}`, payload);
      message.success("Sửa mã giảm giá thành công");
      nav("/discounts");
    } catch (err: any) {
      console.error(err);
    const errMessage = err.response?.data?.message || "Lỗi khi thêm mã giảm giá";
    message.error(errMessage);
    }
  };


  return (
    <div className="p-4">
      <Card>
        <Title level={4}>Sửa mã giảm giá</Title>
        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Mã giảm giá" name="code" rules={[
                { required: true, message: "Vui lòng không bỏ trống" },
                { min: 5, message: "Tối thiểu 5 ký tự" },
              ]}>
                <Input placeholder="Mã code" />
              </Form.Item>
              <Form.Item label="Kiểu giảm giá" name="type" rules={[{ required: true }]}>
                <Select placeholder="Chọn kiểu giảm giá">
                  <Select.Option value="%">%</Select.Option>
                  <Select.Option value="Vnd">Vnđ</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Giá trị giảm" name="value" rules={[{ required: true }]}>
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
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item label="Giới hạn mỗi người dùng" name="usage_per_user" initialValue={1}>
                <Input className="w-full" disabled value={1} placeholder="Mỗi người dùng" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả" rules={[
                { required: true, message: "Vui lòng không bỏ trống" },
                { min: 5, message: "Tối thiểu 5 ký tự" },
              ]}>
                <TextArea rows={4} placeholder="Mô tả chi tiết..." />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Row justify="center">
            <Col>
              <Form.Item>
                <div className="flex gap-4">
                  <Button htmlType="submit" type="primary">Sửa</Button>
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