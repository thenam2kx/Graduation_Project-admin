import { Card, Avatar, Descriptions, Button, Tag, Space, Statistic, Row, Col, Dropdown, Modal, message, Drawer } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined, MoreOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, LockOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { convertTimeVietnam } from "@/utils/utils";
import { fetchOrderByUser } from "@/services/user-service/user.apis";
import { useEffect, useState } from "react";

interface IProps {
  isDrawerOpen: boolean;
  selectedUser: IUser | null;
  setIsDrawerOpen: (open: boolean) => void;
}

const DetailDrawer = (props: IProps) => {
  const { isDrawerOpen, setIsDrawerOpen, selectedUser } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [listOrderByUser, setListOrderByUser] = useState<any>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  useEffect(() => {
    (async () => {
      if (selectedUser?._id) {
        try {
          const res = await fetchOrderByUser(selectedUser._id);
          const orders = res.data?.results || res.data || [];

          setListOrderByUser(res.data);

          if (Array.isArray(orders)) {
            // Tính tổng chi tiêu từ các đơn hàng đã thanh toán
            const total = orders.filter((order: any) => order.paymentStatus === "paid").reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
            setTotalSpent(total);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          messageApi.error("Không thể lấy danh sách đơn hàng của người dùng");
        }
      }
    })();
  }, [selectedUser?._id]);

  const handleEdit = () => {
    messageApi.info("Edit user functionality would be implemented here");
  };

  const handleSuspend = () => {
    Modal.confirm({
      title: "Suspend User",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to suspend this user?",
      okText: "Yes, Suspend",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        messageApi.success("User suspended successfully");
      },
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete User",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to permanently delete this user? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        messageApi.success("User deleted successfully");
      },
    });
  };

  const moreMenuItems: MenuProps["items"] = [
    {
      key: "reset-password",
      label: "Reset Password",
      icon: <LockOutlined />,
    },
    {
      key: "send-email",
      label: "Send Email",
      icon: <MailOutlined />,
    },
    {
      key: "view-orders",
      label: "View Orders",
    },
    {
      type: "divider",
    },
    {
      key: "suspend",
      label: "Suspend User",
      icon: <LockOutlined />,
      danger: true,
      onClick: handleSuspend,
    },
  ];

  return (
    <Drawer title="Thông tin người dùng" width={"90%"} closable={{ "aria-label": "Close Button" }} onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen}>
      <div>
        {contextHolder}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin người dùng</h1>
                <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản người dùng</p>
              </div>
              <Space>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh sửa người dùng
                </Button>
                <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>
          </div>

          <Row gutter={[24, 24]}>
            {/* User Profile Card */}
            <Col xs={24} lg={8}>
              <Card className="h-fit">
                <div className="text-center mb-6">
                  <Avatar size={120} src={selectedUser?.avatar} icon={<UserOutlined />} className="mb-4" />
                  <h2 className="text-xl font-semibold mb-2">{selectedUser?.fullName}</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Tag color={selectedUser?.status === "active" ? "green" : "red"}>{selectedUser?.status?.toUpperCase()}</Tag>
                    {selectedUser?.isVerified && <Tag color="blue">VERIFIED</Tag>}
                  </div>
                  <p className="text-gray-600">{selectedUser?.role}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-gray-400" />
                    <span className="text-sm">{selectedUser?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-gray-400" />
                    <span className="text-sm">{selectedUser?.phone ? `+84 ${selectedUser?.phone}` : "+84"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-400" />
                    <span className="text-sm">{convertTimeVietnam(selectedUser?.createdAt as unknown as string)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button danger block icon={<DeleteOutlined />} onClick={handleDelete}>
                    Xóa tài khoản
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Main Content */}
            <Col xs={24} lg={16}>
              <div className="space-y-6">
                {/* Statistics */}
                <Card title="Thống kê người dùng" className="w-full">
                  <Row gutter={16}>
                    <Col xs={12} sm={8}>
                      <Statistic title="Tổng đơn hàng" value={listOrderByUser?.meta?.total || 0} className="text-center" />
                    </Col>
                    <Col xs={12} sm={8}>
                      <Statistic title="Tổng chi tiêu" value={totalSpent.toLocaleString("vi-VN")} suffix="đ" className="text-center" />
                    </Col>
                  </Row>
                </Card>

                {/* User Details */}
                <Card title="Thông tin người dùng" className="w-full">
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                    <Descriptions.Item label="ID">{selectedUser?._id}</Descriptions.Item>
                    <Descriptions.Item label="Họ tên">{selectedUser?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedUser?.email}</Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">{selectedUser?.phone}</Descriptions.Item>
                    {/* Địa chỉ giao hàng từ đơn hàng mới nhất */}
                    <Descriptions.Item label="Địa chỉ giao hàng (gần đây nhất)">
                      {(() => {
                        const orders = listOrderByUser?.results || listOrderByUser || [];
                        if (Array.isArray(orders) && orders.length > 0) {
                          // tìm đơn hàng mới nhất có địa chỉ
                          const latestOrder = orders.filter((o: any) => o.addressFree || o.addressId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                          if (latestOrder?.addressFree) {
                            const addr = latestOrder.addressFree;
                            return `${addr.province}, ${addr.district}, ${addr.ward}, ${addr.address}`;
                          }

                          if (latestOrder?.addressId) {
                            const addr = latestOrder.addressId;
                            return `${addr.province}, ${addr.district}, ${addr.ward}, ${addr.address}`;
                          }
                        }
                        return "Chưa có địa chỉ giao hàng";
                      })()}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái tài khoản">
                      <Tag color={selectedUser?.status === "active" ? "green" : "red"}>{selectedUser?.status && selectedUser?.status.toUpperCase()}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Email Verified">
                      <Tag color={selectedUser?.isVerified ? "green" : "orange"}>{selectedUser?.isVerified ? "VERIFIED" : "PENDING"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Vai trò">{selectedUser?.role}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{selectedUser?.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="Đăng nhập cuối">{selectedUser?.updatedAt}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Drawer>
  );
};

export default DetailDrawer;
