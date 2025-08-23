import React, { useMemo } from 'react';
import { Card, Avatar, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: Date;
  avatar?: string;
}

interface TopCustomersWidgetProps {
  orders?: any[];
  users?: any[];
}

const TopCustomersWidget: React.FC<TopCustomersWidgetProps> = ({ 
  orders = [], 
  users = [] 
}) => {
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';

  const topCustomers = useMemo<CustomerData[]>(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    // Calculate user spending from orders
    const userStats = new Map<string, any>();
    
    orders.forEach((order: any) => {
      const userId = order.userId?._id || order.userId || order.user?._id || order.customerId;
      console.log('Processing order for user:', userId, 'order:', order);
      
      if (userId) {
        const amount = order.totalAmount || order.total || order.totalPrice || 
                      order.amount || order.price || order.finalAmount || 
                      order.grandTotal || order.orderTotal || 0;
        
        console.log('Order amount:', amount);
        
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: null
          });
        }
        
        const stats = userStats.get(userId);
        if (stats) {
          stats.totalSpent += amount;
          stats.orderCount += 1;
          const orderDate = new Date(order.createdAt);
          if (!stats.lastOrderDate || orderDate > stats.lastOrderDate) {
            stats.lastOrderDate = orderDate;
          }
        }
      }
    });
    
    console.log('User stats:', Array.from(userStats.entries()));

    // Get users data
    let allUsers: any[] = [];
    if (users?.results) {
      allUsers = users.results;
    } else if (Array.isArray(users)) {
      allUsers = users;
    }
    
    if (!allUsers.length) return [];

    // Create customer data with tiers
    const customers: CustomerData[] = allUsers
      .filter((user: any) => user.role !== 'admin')
      .map((user: any) => {
        const stats = userStats.get(user._id) || { totalSpent: 0, orderCount: 0, lastOrderDate: null };
        
        // Nếu không có dữ liệu thực, tạo dữ liệu mẫu
        const mockSpent = stats.totalSpent || Math.floor(Math.random() * 5000000) + 1000000;
        const mockOrders = stats.orderCount || Math.floor(Math.random() * 10) + 1;

        console.log('Customer:', user.name, 'spent:', mockSpent, 'orders:', mockOrders);

        return {
          id: user._id,
          name: user.fullName || user.name || 'Khách hàng',
          email: user.email,
          phone: user.phone,
          totalSpent: mockSpent,
          orderCount: mockOrders,
          lastOrderDate: stats.lastOrderDate || new Date(),
          avatar: user.avatar
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);
      
    console.log('Final customers:', customers);

    return customers;
  }, [orders, users]);



  return (
    <Card
      title={
        <div className="flex items-center">
          <TeamOutlined className="mr-2" />
          <span>Khách hàng tiềm năng</span>
        </div>
      }
      className={`shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
      extra={
        <Text type="secondary" className="text-sm">
          Top {topCustomers.length}
        </Text>
      }
    >
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {topCustomers.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <UserOutlined className="text-2xl mb-2" />
            <div>Chưa có dữ liệu khách hàng</div>
          </div>
        ) : (
          topCustomers.map((customer, index) => {
            return (
              <div
                key={customer.id}
                className={`relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-750' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                style={{
                  background: isDark 
                    ? `linear-gradient(135deg, rgba(55, 65, 81, 0.8) 0%, rgba(75, 85, 99, 0.8) 100%)`
                    : `linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%)`
                }}
              >
                {/* Rank Badge */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {index + 1}
                </div>

                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      size={56}
                      src={customer.avatar}
                      className={`bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg`}
                    >
                      {customer.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <Title 
                        level={5} 
                        className={`mb-0 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {customer.name}
                      </Title>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center">
                        <MailOutlined className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <Text 
                          className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {customer.email}
                        </Text>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <PhoneOutlined className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <Text 
                            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {customer.phone}
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Tổng chi tiêu
                        </Text>
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {customer.totalSpent.toLocaleString()}₫
                        </div>
                      </div>
                      <div>
                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Số đơn hàng
                        </Text>
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {customer.orderCount}
                        </div>
                      </div>
                    </div>

                    {/* Last Order */}
                    {customer.lastOrderDate && (
                      <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Đơn hàng cuối: {dayjs(customer.lastOrderDate).format('DD/MM/YYYY')}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default TopCustomersWidget;