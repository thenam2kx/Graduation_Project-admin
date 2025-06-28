import { Table, message, Tooltip, Button, Space, Dropdown } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/axios.customize";
import { IOrder, IOrderResponse } from "@/types/orders";
import { useNavigate } from "react-router";
import { getPaymentMethodLabel, getStatusTagColor, ORDER_STATUS, ORDER_STATUS_FLOW } from "./order.constant";
import { Tag } from "antd";
import { useState } from "react";



const OrderPage = () => {
  
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const nav = useNavigate();
  const { data, isLoading, refetch } = useQuery<IOrderResponse, Error>({
  queryKey: ["orders", pagination.current, pagination.pageSize] as const,

  queryFn: async () => {
    const res = await instance.get("/api/v1/orders/by-user/683f11fbc1c5cb3b5e991c17", {
      params: {
        page: pagination.current,
        limit: pagination.pageSize,
      },
    });
    console.log("Order data:", res.data);
    
    return res.data as IOrderResponse;
  },
  staleTime: 1000 * 60,
});

const handleChangeStatus = (record: IOrder, statusKey: string, label: string) => {
  const defaultReason =
    statusKey === "cancelled"
      ? "Huỷ bởi admin"
      : statusKey === "refunded"
      ? "Hoàn tiền bởi admin"
      : undefined;

  instance
    .patch(`/api/v1/orders/${record._id}/status`, {
      status: statusKey,
      reason: defaultReason,
    })
    .then(() => {
      message.success(`Đã cập nhật trạng thái: ${label}`);
      refetch()

    })
    .catch(() => {
      message.error("Cập nhật thất bại");
    });
};


  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Trạng thái",
      dataIndex: "statusLabel",
      key: "status",
      render: (_: any, record: IOrder) => (
        <Tag color={getStatusTagColor(record.status)}>{record.statusLabel}</Tag>
      ),
    },
    {
    title: "Hình thức thanh toán",
    dataIndex: "paymentMethod", 
    key: "paymentMethod",
    render: (value: string) => getPaymentMethodLabel(value),
    },

    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (value: number) => `${value.toLocaleString()} đ`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: IOrder) => {
        const currentIndex = ORDER_STATUS_FLOW.indexOf(record.status);
        const menuItems = ORDER_STATUS.filter((status) => {
          const newIndex = ORDER_STATUS_FLOW.indexOf(status.key);
          const isCancelled = status.key === "cancelled";
          const isRefunded = status.key === "refunded";
          const canCancel = ["pending", "confirmed", "processing"].includes(record.status);

          if (isCancelled && !canCancel) return false;
          if (record.status === "refunded" && isCancelled) return false;
          if (isRefunded && !["delivered"].includes(record.status)) return false;

          return newIndex >= currentIndex || (isCancelled && canCancel);
        }).map((status) => ({
          key: status.key,
          label: status.label,
          onClick: () => handleChangeStatus(record, status.key, status.label),
        }));

        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined style={{ fontSize: "18px" }} />}
                onClick={() => nav(`/ordersDetails/${record._id}`)}
              />
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Tooltip title="Thay đổi trạng thái">
                <Button type="text" icon={<EditOutlined style={{ fontSize: "18px" }} />} />
              </Tooltip>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      </div>
      {isLoading ? (
  <div className="text-center py-10">Đang tải đơn hàng...</div>
) : (
  <Table
  columns={columns}
  dataSource={data?.results || []}
  rowKey="_id"
  pagination={{
    current: data?.meta?.current || 1,
    pageSize: data?.meta?.pageSize || 10,
    total: data?.meta?.total || 0,
    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
  }}
/>

)}

    </div>
  );
};

export default OrderPage;
