import React, { useMemo } from 'react';
import { Card, List, Badge, Avatar, Typography, Button, Divider } from 'antd';
import { 
  BellOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationWidgetProps {
  orders?: any[];
  products?: any[];
  users?: any[];
}

const NotificationWidget: React.FC<NotificationWidgetProps> = ({ 
  orders = [], 
  products = [], 
  users = [] 
}) => {
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';

  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];

    // Low stock alerts
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);
    if (lowStockProducts.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Sản phẩm sắp hết hàng',
        message: `${lowStockProducts.length} sản phẩm có tồn kho dưới 10`,
        time: dayjs().format('HH:mm'),
        icon: <WarningOutlined />,
        priority: 'high'
      });
    }

    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0) {
      notifs.push({
        id: 'pending-orders',
        type: 'info',
        title: 'Đơn hàng chờ xử lý',
        message: `${pendingOrders.length} đơn hàng cần được xử lý`,
        time: dayjs().format('HH:mm'),
        icon: <ShoppingCartOutlined />,
        priority: 'medium'
      });
    }

    // New users today
    const today = dayjs().startOf('day');
    const newUsersToday = users.filter(u => dayjs(u.createdAt).isAfter(today));
    if (newUsersToday.length > 0) {
      notifs.push({
        id: 'new-users',
        type: 'success',
        title: 'Khách hàng mới',
        message: `${newUsersToday.length} khách hàng mới đăng ký hôm nay`,
        time: dayjs().format('HH:mm'),
        icon: <UserOutlined />,
        priority: 'low'
      });
    }

    return notifs
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  }, [orders, products, users]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return '#faad14';
      case 'error': return '#ff4d4f';
      case 'success': return '#52c41a';
      default: return '#1890ff';
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <BellOutlined className="mr-2" />
          <span>Thông báo</span>
          <Badge 
            count={notifications.length} 
            offset={[10, 0]}
            className="ml-2"
          />
        </div>
      }
      className={`shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
      bodyStyle={{ padding: '12px' }}
    >
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <BellOutlined className="text-2xl mb-2" />
            <div>Không có thông báo mới</div>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            split={false}
            renderItem={(item) => (
              <List.Item
                className={`p-3 rounded-lg mb-2 transition-all hover:shadow-md ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{
                  borderLeft: `4px solid ${getTypeColor(item.type)}`
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={item.icon}
                      style={{ 
                        backgroundColor: getTypeColor(item.type)
                      }}
                    />
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <Text 
                        strong 
                        className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {item.title}
                      </Text>
                      <Text 
                        type="secondary" 
                        className="text-xs"
                      >
                        {item.time}
                      </Text>
                    </div>
                  }
                  description={
                    <Text 
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {item.message}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
};

export default NotificationWidget;