import instance from "@/config/axios.customize";
import { IDiscounts } from "@/types/discounts";
import dayjs from "dayjs";
import {
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Select,
  Form,
  Button,
  Card,
  Typography,
  Divider,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router";

const { Title } = Typography;
const DiscountsAdd = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();

const handleFinish = async (values: IDiscounts) => {
  try {
    const payload = {
      ...values,
      startDate: values.startDate?.toISOString() || null,
      endDate: values.endDate?.toISOString() || null,
    };

    await instance.post("/api/v1/discounts/", payload);
    message.success("Thêm mã giảm giá thành công");
    nav("/discounts");
  } catch (err:any) {
     console.error(err);
    const errMessage = err.response?.data?.message || "Lỗi khi thêm mã giảm giá";
    message.error(errMessage);
  }
};

  return (
    <div className="p-4">
      <Card >
        <Title level={4}>Tạo mã giảm giá</Title>

        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Row gutter={24}>
            {/* Cột trái */}
            <Col span={12}>
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <Input placeholder="Mã code" />
              </Form.Item>

              <Form.Item
                label="Kiểu giảm giá"
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

              <Form.Item 
                label="Giảm tối đa" 
                name="max_discount_amount"
                rules={[{ required: true, message: "Vui lòng nhập giảm tối đa" }]}
              >
                <Input className="w-full" min={0} placeholder="Giảm tối đa" />
              </Form.Item>

              <Form.Item 
                label="Giá trị đơn hàng tối thiểu" 
                name="min_order_value"
                rules={[{ required: true, message: "Vui lòng nhập giá trị tối thiểu" }]}
              >
                <Input className="w-full" min={0} placeholder="Giá trị tối thiểu" />
              </Form.Item>

              <Form.Item 
                label="Giới hạn toàn hệ thống" 
                name="usage_limit"
                rules={[{ required: true, message: "Vui lòng nhập giới hạn sử dụng" }]}
              >
                <Input className="w-full" min={0} max={100} placeholder="Giới hạn sử dụng" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
              <Form.Item 
                label="Giới hạn mỗi người dùng" 
                name="usage_per_user"
                rules={[{ required: true, message: "Vui lòng nhập giới hạn mỗi người dùng" }]}
              >
                <Input className="w-full" min={0} max={1} placeholder="Mỗi người dùng" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: "Vui lòng không bỏ trống" },
                  { min: 5, message: "Tối thiểu 5 ký tự" },
                ]}
              >
                <TextArea rows={4} placeholder="Mô tả chi tiết..." />
              </Form.Item>
            </Col>
          </Row>
          <Divider />         
          <Row justify="center">
            <Col>
              <Form.Item>
                <div className="flex gap-4">
                  <Button htmlType="submit" type="primary">
                    Thêm
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

export default DiscountsAdd;