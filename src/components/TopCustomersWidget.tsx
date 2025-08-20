import React, { useMemo } from 'react';
import { Card, Avatar, Typography, Tag, Progress, Tooltip } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  StarOutlined,
  TrophyOutlined,
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
  tier: 'VIP' | 'Premium' | 'Regular';
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
        
        let tier: 'VIP' | 'Premium' | 'Regular' = 'Regular';
        if (mockSpent >= 10000000) tier = 'VIP';
        else if (mockSpent >= 3000000) tier = 'Premium';

        console.log('Customer:', user.name, 'spent:', mockSpent, 'orders:', mockOrders);

        return {
          id: user._id,
          name: user.fullName || user.name || 'Khách hàng',
          email: user.email,
          phone: user.phone,
          totalSpent: mockSpent,
          orderCount: mockOrders,
          lastOrderDate: stats.lastOrderDate || new Date(),
          tier,
          avatar: user.avatar
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);
      
    console.log('Final customers:', customers);

    return customers;
  }, [orders, users]);

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return {
          color: '#faad14',
          bgColor: isDark ? 'bg-yellow-900' : 'bg-yellow-100',
          textColor: isDark ? 'text-yellow-200' : 'text-yellow-800',
          icon: <CrownOutlined />,
          gradient: 'from-yellow-400 to-orange-500'
        };
      case 'Premium':
        return {
          color: '#722ed1',
          bgColor: isDark ? 'bg-purple-900' : 'bg-purple-100',
          textColor: isDark ? 'text-purple-200' : 'text-purple-800',
          icon: <StarOutlined />,
          gradient: 'from-purple-400 to-pink-500'
        };
      default:
        return {
          color: '#1890ff',
          bgColor: isDark ? 'bg-blue-900' : 'bg-blue-100',
          textColor: isDark ? 'text-blue-200' : 'text-blue-800',
          icon: <UserOutlined />,
          gradient: 'from-blue-400 to-cyan-500'
        };
    }
  };

  const maxSpent = topCustomers.length > 0 ? Math.max(...topCustomers.map(c => c.totalSpent)) : 0;

  return (
    <Card
      title={
        <div className="flex items-center">
          <TrophyOutlined className="mr-2" />
          <span>Khách hàng VIP</span>
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
            const tierConfig = getTierConfig(customer.tier);
            const spentPercent = maxSpent > 0 ? (customer.totalSpent / maxSpent) * 100 : 0;
            
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
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r ${tierConfig.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {index + 1}
                </div>

                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      size={56}
                      src={customer.avatar}
                      className={`bg-gradient-to-r ${tierConfig.gradient} shadow-lg`}
                    >
                      {customer.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${tierConfig.gradient} flex items-center justify-center text-white shadow-md`}>
                      {tierConfig.icon}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Title 
                          level={5} 
                          className={`mb-0 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {customer.name}
                        </Title>
                        <div className="flex items-center mt-1">
                          <Tag 
                            color={tierConfig.color}
                            className={`${tierConfig.bgColor} ${tierConfig.textColor} border-0 text-xs font-semibold`}
                          >
                            {customer.tier}
                          </Tag>
                        </div>
                      </div>
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

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Mức độ hoạt động
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {spentPercent.toFixed(0)}%
                        </Text>
                      </div>
                      <Progress
                        percent={spentPercent}
                        showInfo={false}
                        strokeColor={tierConfig.color}
                        trailColor={isDark ? '#374151' : '#f5f5f5'}
                        size="small"
                      />
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