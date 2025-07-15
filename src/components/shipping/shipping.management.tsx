import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Space, Modal, message, Tooltip, Card, Typography, Descriptions } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined, CarOutlined, StopOutlined } from '@ant-design/icons';
import axios from '../../config/axios.customize';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;

// Mapping for shipping status colors
const statusColors: Record<string, string> = {
  'ready_to_pick': 'blue',
  'picking': 'cyan',
  'picked': 'geekblue',
  'delivering': 'purple',
  'delivered': 'green',
  'delivery_fail': 'orange',
  'waiting_to_return': 'gold',
  'return': 'volcano',
  'returned': 'red',
  'cancel': 'magenta',
  'exception': 'error',
};

// Mapping for shipping status names in Vietnamese
const statusNames: Record<string, string> = {
  'ready_to_pick': 'Chờ lấy hàng',
  'picking': 'Đang lấy hàng',
  'picked': 'Đã lấy hàng',
  'delivering': 'Đang giao hàng',
  'delivered': 'Đã giao hàng',
  'delivery_fail': 'Giao hàng thất bại',
  'waiting_to_return': 'Chờ trả hàng',
  'return': 'Đang trả hàng',
  'returned': 'Đã trả hàng',
  'cancel': 'Đã hủy',
  'exception': 'Ngoại lệ',
};

const ShippingManagement: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Fetch orders with shipping information
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders-with-shipping'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/orders');
      console.log('Orders response:', response.data);
      
      // Kiểm tra cấu trúc dữ liệu thực tế
      const results = response.data?.results || [];
      console.log('Orders array:', results);
      
      // Filter orders that have shipping information
      const filteredOrders = results.filter((order: any) => {
        console.log('Order:', order._id, 'has shipping:', !!order.shipping?.orderCode);
        return order.shipping?.orderCode;
      });
      
      console.log('Filtered orders with shipping:', filteredOrders.length);
      return filteredOrders;
    },
    refetchOnWindowFocus: true
  });

  // Hàm cập nhật trạng thái tất cả đơn hàng có vận đơn
  const updateAllOrdersStatus = useCallback(async () => {
    if (!orders || orders.length === 0) return;
    
    try {
      // Lấy tất cả đơn hàng có mã vận đơn
      const ordersWithShipping = orders.filter(order => order.shipping?.orderCode);
      console.log(`Đang cập nhật trạng thái cho ${ordersWithShipping.length} đơn hàng`);
      
      // Cập nhật từng đơn hàng
      for (const order of ordersWithShipping) {
        try {
          const response = await axios.get(`/api/v1/ghn/order-status/${order._id}`);
          console.log(`Đã cập nhật trạng thái đơn hàng ${order._id}`);
          
          // Đồng bộ trạng thái đơn hàng với trạng thái vận chuyển
          const updatedOrder = response.data.data.order;
          if (updatedOrder?.shipping?.statusCode === 'cancel') {
            // Nếu GHN đã hủy đơn, cập nhật trạng thái đơn hàng thành 'cancelled'
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'cancelled',
              reason: 'Hủy bởi GHN'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái hủy`);
          } else if (updatedOrder?.shipping?.statusCode === 'delivered') {
            // Nếu GHN đã giao hàng, cập nhật trạng thái đơn hàng thành 'delivered'
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'delivered'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái đã giao hàng`);
          }
          
          // Đợi 500ms giữa các request để tránh quá tải API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Lỗi cập nhật đơn hàng ${order._id}:`, error);
        }
      }
      
      // Cập nhật thời gian làm mới cuối cùng
      setLastRefreshTime(new Date().toLocaleTimeString());
      // Làm mới dữ liệu
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    }
  }, [orders, queryClient]);
  
  // Cập nhật tự động mỗi 5 phút
  useEffect(() => {
    if (!autoRefresh || !orders) return;
    
    // Cập nhật ngay khi component được tải và có dữ liệu
    updateAllOrdersStatus();
    
    // Thiết lập interval để cập nhật định kỳ
    const intervalId = setInterval(() => {
      updateAllOrdersStatus();
    }, 5 * 60 * 1000); // 5 phút
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, updateAllOrdersStatus, orders]);

  // Create shipping order mutation
  const createShippingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await axios.post(`/api/v1/ghn/create-order/${orderId}`);
    },
    onSuccess: () => {
      message.success('Đã tạo đơn vận chuyển thành công');
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    },
    onError: (error: any) => {
      message.error(`Lỗi khi tạo đơn vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Get shipping status mutation
  const getStatusMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await axios.get(`/api/v1/ghn/order-status/${orderId}`);
    },
    onSuccess: async (data) => {
      message.success('Đã cập nhật trạng thái vận chuyển');
      
      // Đồng bộ trạng thái đơn hàng với trạng thái vận chuyển
      const updatedOrder = data.data.data.order;
      if (updatedOrder?.shipping?.statusCode === 'cancel') {
        // Nếu GHN đã hủy đơn, cập nhật trạng thái đơn hàng thành 'cancelled'
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'cancelled',
          reason: 'Hủy bởi GHN'
        });
        message.warning('Đơn hàng đã bị hủy bởi GHN');
      } else if (updatedOrder?.shipping?.statusCode === 'delivered') {
        // Nếu GHN đã giao hàng, cập nhật trạng thái đơn hàng thành 'delivered'
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'delivered'
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
      
      // Show status details
      setSelectedOrder(data.data.data.order);
      setDetailModalVisible(true);
    },
    onError: (error: any) => {
      message.error(`Lỗi khi lấy trạng thái vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Cancel shipping order mutation
  const cancelShippingMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return await axios.post(`/api/v1/ghn/cancel-order/${orderId}`, { reason });
    },
    onSuccess: () => {
      message.success('Đã hủy đơn vận chuyển thành công');
      setCancelModalVisible(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    },
    onError: (error: any) => {
      message.error(`Lỗi khi hủy đơn vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Handle create shipping order
  const handleCreateShipping = (orderId: string) => {
    createShippingMutation.mutate(orderId);
  };

  // Handle get shipping status
  const handleGetStatus = (orderId: string) => {
    getStatusMutation.mutate(orderId);
  };

  // Handle cancel shipping
  const handleCancelShipping = () => {
    if (!selectedOrder?._id) return;
    
    cancelShippingMutation.mutate({
      orderId: selectedOrder._id,
      reason: cancelReason || 'Hủy bởi quản trị viên'
    });
  };

  // Show detail modal
  const showDetailModal = (order: any) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (text: string) => <span>{text.slice(-8)}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user: any) => <span>{user?.fullName || user?.name || 'Không có tên'}</span>,
    },
    {
      title: 'Mã vận đơn GHN',
      dataIndex: ['shipping', 'orderCode'],
      key: 'orderCode',
      render: (text: string) => <span>{text || 'Chưa có'}</span>,
    },
    {
      title: 'Trạng thái vận chuyển',
      dataIndex: ['shipping', 'statusCode'],
      key: 'statusCode',
      render: (status: string, record: any) => {
        // Nếu đơn hàng đã hủy, chỉ hiển thị "Đã hủy"
        if (status === 'cancel' || record.status === 'cancelled') {
          return <Tag color="red">Đã hủy</Tag>;
        }
        
        // Hiển thị trạng thái vận chuyển bình thường
        const color = statusColors[status] || 'default';
        const statusText = record.shipping?.statusName || statusNames[status] || 'Không xác định';
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: 'Thời gian dự kiến',
      dataIndex: ['shipping', 'expectedDeliveryTime'],
      key: 'expectedDeliveryTime',
      render: (text: string) => <span>{text || 'Chưa xác định'}</span>,
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: ['shipping', 'fee'],
      key: 'fee',
      render: (fee: number) => <span>{fee?.toLocaleString('vi-VN')}đ</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => showDetailModal(record)} 
              type="primary" 
              ghost
            />
          </Tooltip>
          
          {!record.shipping?.orderCode && (
            <Tooltip title="Tạo vận đơn">
              <Button 
                icon={<CarOutlined />} 
                onClick={() => handleCreateShipping(record._id)} 
                type="primary"
                loading={createShippingMutation.isPending}
              />
            </Tooltip>
          )}
          
          {record.shipping?.orderCode && (
            <Tooltip title="Xem trạng thái mới nhất">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => handleGetStatus(record._id)} 
                loading={getStatusMutation.isPending}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Title level={4}>Quản lý vận chuyển</Title>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {lastRefreshTime ? `Cập nhật lần cuối: ${lastRefreshTime}` : ''}
              {autoRefresh && <span> (Tự động cập nhật mỗi 5 phút)</span>}
            </div>
          </div>
          <div>
            <Button 
              style={{ marginRight: 8 }}
              type={autoRefresh ? "primary" : "default"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Tắt tự động cập nhật' : 'Bật tự động cập nhật'}
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => updateAllOrdersStatus()}
            >
              Cập nhật trạng thái
            </Button>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={orders || []} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title="Chi tiết vận đơn"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="Thông tin đơn hàng" bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">{selectedOrder._id}</Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn GHN">{selectedOrder.shipping?.orderCode || 'Chưa có'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái vận chuyển">
                {selectedOrder.shipping?.statusCode === 'cancel' || selectedOrder.status === 'cancelled' ? (
                  <Tag color="red">Đã hủy</Tag>
                ) : (
                  <Tag color={statusColors[selectedOrder.shipping?.statusCode] || 'default'}>
                    {selectedOrder.shipping?.statusName || statusNames[selectedOrder.shipping?.statusCode] || 'Không xác định'}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                {selectedOrder.shipping?.expectedDeliveryTime || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {selectedOrder.shipping?.fee?.toLocaleString('vi-VN')}đ
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền đơn hàng">
                {selectedOrder.totalPrice?.toLocaleString('vi-VN')}đ
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin người nhận" bordered column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="Tên người nhận">
                {selectedOrder.userId?.fullName || selectedOrder.userId?.name || 'Không có tên'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.userId?.phone || 'Không có số điện thoại'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.addressFree?.address || selectedOrder.addressId?.address || 'Không có địa chỉ'}
                {', '}
                {selectedOrder.addressFree?.ward || selectedOrder.addressId?.ward || ''}
                {', '}
                {selectedOrder.addressFree?.district || selectedOrder.addressId?.district || ''}
                {', '}
                {selectedOrder.addressFree?.province || selectedOrder.addressId?.province || ''}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Cancel Shipping Modal */}
      <Modal
        title="Hủy vận đơn"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={handleCancelShipping}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        confirmLoading={cancelShippingMutation.isPending}
      >
        <p>Bạn có chắc chắn muốn hủy vận đơn này?</p>
        <p>Mã đơn hàng: {selectedOrder?._id}</p>
        <p>Mã vận đơn GHN: {selectedOrder?.shipping?.orderCode}</p>
        
        <div style={{ marginTop: 16 }}>
          <Text strong>Lý do hủy:</Text>
          <textarea
            style={{ width: '100%', padding: 8, marginTop: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy vận đơn"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ShippingManagement;
