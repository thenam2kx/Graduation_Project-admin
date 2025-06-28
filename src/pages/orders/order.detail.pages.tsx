import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Divider, Table, Typography, Image, Spin, Button } from "antd";
import instance from "@/config/axios.customize";
import { IOrder, IOrderItem } from "@/types/orders";
import { getPaymentMethodLabel, getPaymentStatusLabel, getShippingMethodLabel } from "./order.constant";

const { Title } = Typography;

const OrderDetailPage = () => {

  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useQuery<IOrder>({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      const res = await instance.get(`/api/v1/orders/${orderId}`);
      
      return res.data || null;
    },
    enabled: !!orderId,
  });

  const { data: orderItems = [], isLoading: isLoadingItems } = useQuery<IOrderItem[]>({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const res = await instance.get(`/api/v1/orders/${orderId}/items`);
      console.log(res);
      
      return res.data || [];
    },
    enabled: !!orderId,
  });

  const formatCurrency = (value?: number) => (typeof value === "number" ? `${value.toLocaleString()} đ` : "N/A");

  const formatFullAddress = (address: any) => {
    if (!address) return "N/A";
    const parts = [address.hamlet, address.ward, address.district, address.province].filter(Boolean);

    return parts.join(", ");
  };

  if (isLoading) return <Spin size="large" />;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div>
      {/* Nút Quay lại */}
      <Button type="primary" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Title level={3}>Chi tiết đơn hàng</Title>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Mã đơn">{order._id}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(order.createdAt).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Tên người dùng">{order.userId?.fullName || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.userId?.email || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.userId?.phone || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng" span={2}>{formatFullAddress(order.addressId)}</Descriptions.Item>
        <Descriptions.Item label="Mã giảm giá">{order.discountId || "Không áp dụng"}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{order.statusLabel}</Descriptions.Item>
        <Descriptions.Item label="Hình thức vận chuyển">{getShippingMethodLabel(order.shippingMethod)}</Descriptions.Item>
        <Descriptions.Item label="Hình thức thanh toán">{getPaymentMethodLabel(order.paymentMethod)}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">{getPaymentStatusLabel(order.paymentStatus)}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú" span={2}>
          {order.note || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{formatCurrency(order.totalPrice)}</Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">{formatCurrency(order.shippingPrice)}</Descriptions.Item>
        <Descriptions.Item label="Lí do hủy/hoàn tiền">{order.reason}</Descriptions.Item>

      </Descriptions>
      <Divider />
      <Title level={4}>Sản phẩm trong đơn hàng</Title>

      <Table
        dataSource={orderItems}
        rowKey="_id"
        loading={isLoadingItems}
        pagination={false}
        columns={[
          {
            title: "Tên sản phẩm",
            dataIndex: ["productId", "name"],
            key: "name",
          },
          {
           title:"Mã sản phẩm",
           dataIndex:['variantId','sku'],
           key:'sku'
          },
         {
          title: "Ảnh",
          key: "image",
          render: (_: any, record: IOrderItem) => (
            <Image
              src={record.productId?.image?.[0] || '/placeholder.svg'}
              width={60}
              height={60}
              alt={'image'}
              crossOrigin="anonymous"
            />
          )
        },
          {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (value: number) => `${value.toLocaleString()} đ`,
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
          },
          {
            title: "Tổng",
            key: "total",
            render: (_: any, record: IOrderItem) => `${(record.price * record.quantity).toLocaleString()} đ`,
          },
        ]}
      />
    </div>
  );
};

export default OrderDetailPage;
