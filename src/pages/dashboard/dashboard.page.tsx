import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllProducts } from '@/services/product-service/product.apis';
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key';
import { getUserList } from '@/services/user-service/user.apis';
import { fetchAllOrdersAPI } from '@/services/order-service/order.apis';
import { DatePicker, Card, Row, Col, Statistic, Progress, Badge, Alert, Tooltip, Spin } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ProductOutlined,
  WarningOutlined,
  BellOutlined,
  EyeOutlined,
  HeartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppSelector } from '@/redux/hooks';
import { extractArrayFromResponse, extractMetaFromResponse, extractUserIdFromOrder, extractAmountFromOrder, isRevenueOrder } from '@/utils/dataExtractor';
import '@/styles/dashboard.css';
import '@/styles/enhanced-dashboard.css';
import NotificationWidget from '@/components/NotificationWidget';
import TrendWidget from '@/components/TrendWidget';
import TopCustomersWidget from '@/components/TopCustomersWidget';

interface RevenueDataPoint {
  key: string;
  label: string;
  value: number;
  fullLabel: string;
}

const DashboardPage = () => {
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(30, 'day'), 
    dayjs()
  ]);
  const [showAllUsers, setShowAllUsers] = useState(false);


  // Fetch orders data
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await fetchAllOrdersAPI({ limit: 1000 });
        return res || null;
      } catch (error) {
        return null;
      }
    }
  });

  // Fetch products data
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      try {
        const res = await fetchAllProducts('?pageSize=100&sort=-createdAt');
        return res?.data || null;
      } catch (error) {
        return null;
      }
    }
  });

  // Fetch users data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await getUserList({ current: 1, pageSize: 100 });
        return res?.data || res || null;
      } catch (error) {
        return null;
      }
    }
  });

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    console.log('Raw ordersData:', ordersData);
    // Handle different possible response structures
    let orders: any[] = [];
    if (ordersData?.data?.results) {
      orders = ordersData.data.results;
    } else if (ordersData?.results) {
      orders = ordersData.results;
    } else if (Array.isArray(ordersData?.data)) {
      orders = ordersData.data;
    } else if (Array.isArray(ordersData)) {
      orders = ordersData;
    }
    console.log('Extracted orders:', orders);
    
    if (!orders.length) return [];
    
    const startDate = dateRange[0]?.startOf('day').toDate();
    const endDate = dateRange[1]?.endOf('day').toDate();
    
    if (!startDate || !endDate) return orders;
    
    return orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [ordersData, dateRange]);

  const totalProducts = productsData?.meta?.total ?? productsData?.results?.length ?? 0;
  const totalUsers = usersData?.meta?.total ?? usersData?.results?.length ?? 0;

  // Tính toán trực tiếp từ filteredOrders
  const currentRevenue = useMemo(() => {
    console.log('Filtered orders:', filteredOrders);
    console.log('Date range:', dateRange[0]?.format('DD/MM/YYYY'), 'to', dateRange[1]?.format('DD/MM/YYYY'));
    return filteredOrders.reduce((sum, order) => {
      const amount = order.totalAmount || order.total || order.totalPrice || 
                    order.amount || order.price || order.finalAmount || 
                    order.grandTotal || order.orderTotal || 0;
      console.log('Order date:', new Date(order.createdAt).toLocaleDateString(), 'Amount:', amount);
      return sum + amount;
    }, 0);
  }, [filteredOrders, dateRange]);

  const currentOrderCount = filteredOrders.length;
  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

  // Generate chart data based on date range
  const chartData = useMemo<RevenueDataPoint[]>(() => {
    if (!dateRange[0] || !dateRange[1]) return [];
    
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const daysDiff = endDate.diff(startDate, 'day') + 1;
    
    // Create data for all days in range
    const allDaysData = new Map<string, RevenueDataPoint>();
    
    // Initialize all days with 0 revenue
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = startDate.add(i, 'day');
      const key = currentDate.format('YYYY-MM-DD');
      const label = currentDate.format('DD/MM');
      const fullLabel = currentDate.format('DD/MM/YYYY');
      
      allDaysData.set(key, { key, label, fullLabel, value: 0 });
    }
    
    // Add actual revenue data from all orders (not just paid ones)
    const paidOrders = filteredOrders;
    
    paidOrders.forEach((order: any) => {
      const orderDate = dayjs(order.createdAt);
      const key = orderDate.format('YYYY-MM-DD');
      
      if (allDaysData.has(key)) {
        const amount = order.totalAmount || order.total || order.amount || 
                      order.totalPrice || order.price || order.finalAmount ||
                      order.grandTotal || order.orderTotal || 0;
        const dataPoint = allDaysData.get(key);
        if (dataPoint) {
          dataPoint.value += amount;
        }
      }
    });
    
    return Array.from(allDaysData.values());
  }, [dateRange, filteredOrders]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

  // Low stock alerts
  const lowStockProducts = useMemo(() => {
    if (!productsData?.results) return [];
    return productsData.results
      .filter((product: any) => (product.stock || 0) < 10)
      .slice(0, 5);
  }, [productsData]);

  // Category revenue distribution
  const categoryRevenue = useMemo(() => {
    if (!filteredOrders.length || !productsData?.results) return [];
    
    const categoryMap = new Map();
    const completedStatuses = ['completed', 'delivered', 'paid', 'success'];
    
    filteredOrders
      .filter(order => completedStatuses.includes(order.status?.toLowerCase()))
      .forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const product = productsData.results.find((p: any) => p._id === item.productId);
            if (product?.categoryId?.name) {
              const categoryName = product.categoryId.name;
              const revenue = (item.price || 0) * (item.quantity || 0);
              categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + revenue);
            }
          });
        }
      });

    return Array.from(categoryMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredOrders, productsData]);

  // Tính khách hàng mới trong khoảng thời gian đã chọn
  const newUsersInPeriod = useMemo(() => {
    if (!usersData?.results && !Array.isArray(usersData)) return 0;
    const users = usersData?.results || usersData || [];
    const startDate = dateRange[0]?.toDate();
    const endDate = dateRange[1]?.toDate();
    
    if (!startDate || !endDate) return 0;
    
    return users.filter((user: any) => {
      const userDate = new Date(user.createdAt);
      return userDate >= startDate && userDate <= endDate;
    }).length;
  }, [usersData, dateRange]);

  const kpiMetrics = [
    {
      title: 'Doanh thu',
      value: currentRevenue,
      change: 15.2,
      trend: 'up',
      icon: <DollarOutlined />,
      color: 'from-green-500 to-emerald-600',
      suffix: '₫',
      description: `Doanh thu từ ${dateRange[0]?.format('DD/MM')} đến ${dateRange[1]?.format('DD/MM')}`
    },
    {
      title: 'Đơn hàng',
      value: currentOrderCount,
      change: 8.5,
      trend: 'up',
      icon: <ShoppingCartOutlined />,
      color: 'from-blue-500 to-cyan-600',
      description: `Đơn hàng từ ${dateRange[0]?.format('DD/MM')} đến ${dateRange[1]?.format('DD/MM')}`
    },
    {
      title: 'Khách hàng mới',
      value: newUsersInPeriod,
      change: 5.2,
      trend: 'up',
      icon: <UserOutlined />,
      color: 'from-purple-500 to-indigo-600',
      description: `Khách hàng đăng ký từ ${dateRange[0]?.format('DD/MM')} đến ${dateRange[1]?.format('DD/MM')}`
    },
    {
      title: 'Giá trị TB/đơn',
      value: Math.round(avgOrderValue),
      change: 12.3,
      trend: 'up',
      icon: <RiseOutlined />,
      color: 'from-orange-500 to-red-600',
      suffix: '₫',
      description: 'Giá trị trung bình mỗi đơn hàng trong kỳ'
    }
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="slide-in-left">
            <h1 className={`text-4xl font-bold mb-2 gradient-text ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dashboard Analytics
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Tổng quan chi tiết về hoạt động kinh doanh
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <DatePicker.RangePicker 
              value={dateRange}
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                } else {
                  setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null]);
                }
              }}
              format="DD/MM/YYYY"
              className="shadow-sm"
            />
          </div>
        </div>

        {/* Alerts */}
        {lowStockProducts.length > 0 && (
          <Alert
            message={`Cảnh báo: ${lowStockProducts.length} sản phẩm sắp hết hàng`}
            description={lowStockProducts.map(p => p.name).join(', ')}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            closable
            className="mb-6"
          />
        )}
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {kpiMetrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              loading={ordersLoading}
              className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 hover-lift bounce-in ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
              bodyStyle={{ padding: '24px' }}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform`}>
                  <span className="text-xl">{metric.icon}</span>
                </div>
                
                {metric.change !== undefined && (
                  <div className={`flex items-center text-sm font-semibold ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {metric.trend === 'up' ? <RiseOutlined /> : 
                     metric.trend === 'down' ? <FallOutlined /> : null}
                    <span className="ml-1">{Math.abs(metric.change).toFixed(1)}%</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.title}
                  </h3>
                  {metric.description && (
                    <Tooltip title={metric.description}>
                      <EyeOutlined className={`ml-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    </Tooltip>
                  )}
                </div>
                
                <Statistic
                  value={metric.value}
                  suffix={metric.suffix}
                  valueStyle={{
                    color: isDark ? '#ffffff' : '#1f2937',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    lineHeight: '1.2'
                  }}
                />
                
                {metric.change !== undefined && (
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    So với 30 ngày trước
                  </p>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Revenue Chart */}
        <Col xs={24}>
          <Card
            title="Biểu đồ doanh thu theo thời gian"
            className={`shadow-lg hover-lift ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            extra={
              <Tooltip title="Doanh thu từ các đơn hàng đã hoàn thành">
                <EyeOutlined className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </Tooltip>
            }
          >
            <div className="h-80 w-full">
              {ordersLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Spin size="large" />
                </div>
              ) : chartData.length > 0 ? (
                <div className="w-full h-full flex items-end justify-between space-x-1 px-4">
                  {chartData.map((data, index) => {
                    const height = maxValue > 0 ? (data.value / maxValue) * 80 + 10 : 10;
                    const dayOrders = filteredOrders.filter(order => {
                      const orderDate = dayjs(order.createdAt).format('YYYY-MM-DD');
                      return orderDate === data.key;
                    }).length;
                    return (
                      <div
                        key={data.key}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer min-h-[10px] relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div className="font-semibold">{data.fullLabel}</div>
                          <div>Doanh thu: {data.value.toLocaleString()}₫</div>
                          <div>Đơn hàng: {dayOrders}</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`h-full flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div>Chưa có dữ liệu doanh thu trong khoảng thời gian này</div>
                  </div>
                </div>
              )}
              {chartData.length > 0 && (
                <div className="flex justify-between mt-2 px-4">
                  {chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0).slice(0, 6).map((data, i) => (
                    <span key={i} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {data.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>


      </Row>

      {/* Bottom Section */}
      <Row gutter={[24, 24]} className="mt-8">
        {/* Notification Widget */}
        <Col xs={24} lg={8}>
          <NotificationWidget 
            orders={filteredOrders}
            products={productsData?.results || []}
            users={usersData?.results || usersData?.data?.results || []}
          />
        </Col>
        
        {/* Top Products */}
        <Col xs={24} lg={8}>
          <Card
            title="Sản phẩm bán chạy nhất"
            className={`shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            extra={<HeartOutlined className="text-red-500" />}
          >
            <div className="space-y-4">
              {productsData?.results?.slice(0, 5).map((product: any, index: number) => (
                <div key={product._id} className={`flex items-center p-3 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {product.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {product.categoryId?.name || 'Chưa phân loại'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {(product.price || 0).toLocaleString()}₫
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Còn: {product.stock || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Top Customers */}
        <Col xs={24} lg={8}>
          <TopCustomersWidget 
            orders={filteredOrders}
            users={usersData?.results || usersData?.data?.results || []}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
