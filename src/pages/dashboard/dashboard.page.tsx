import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllProducts } from '@/services/product-service/product.apis';
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key';
import { getUserList } from '@/services/user-service/user.apis';
import { fetchAllOrdersAPI } from '@/services/order-service/order.apis';
import { DatePicker, theme, Modal } from 'antd';
import dayjs from 'dayjs';
import { useAppSelector } from '@/redux/hooks';
import { extractArrayFromResponse, extractMetaFromResponse, extractUserIdFromOrder, extractAmountFromOrder, isRevenueOrder } from '@/utils/dataExtractor';
import '@/styles/dashboard.css';

interface RevenueDataPoint {
  key: string;
  label: string;
  value: number;
  fullLabel: string;
}

const DashboardPage = () => {
  const { token } = theme.useToken();
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(6, 'month'), 
    dayjs()
  ]);
  const [showAllUsers, setShowAllUsers] = useState(false);


  // Fetch orders data
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await fetchAllOrdersAPI();
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
    const orders = extractArrayFromResponse(ordersData);
    
    if (!orders.length) return [];
    
    const startDate = dateRange[0]?.toDate();
    const endDate = dateRange[1]?.toDate();
    
    if (!startDate || !endDate) return orders;
    
    return orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [ordersData, dateRange]);

  // Calculate totals
  const totalProducts = extractMetaFromResponse(productsData).total;
  const totalUsers = extractMetaFromResponse(usersData).total;
  const totalOrders = filteredOrders.length; // All orders in date range
  
  const totalRevenue = useMemo(() => {
    if (!filteredOrders.length) return 0;
    
    return filteredOrders
      .filter(isRevenueOrder)
      .reduce((sum: number, order: any) => {
        return sum + extractAmountFromOrder(order);
      }, 0);
  }, [filteredOrders]);

  // Generate chart data based on date range
  const chartData = useMemo<RevenueDataPoint[]>(() => {
    if (!dateRange[0] || !dateRange[1]) return [];
    
    const startDate = dateRange[0].toDate();
    const endDate = dateRange[1].toDate();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine chart period based on date range
    let chartPeriod: 'day' | 'month' | 'year';
    if (daysDiff <= 31) {
      chartPeriod = 'day';
    } else if (daysDiff <= 365) {
      chartPeriod = 'month';
    } else {
      chartPeriod = 'year';
    }
    
    if (filteredOrders.length > 0) {
      const paidOrders = filteredOrders.filter(isRevenueOrder);
      
      const groupedData = new Map<string, RevenueDataPoint>();
      
      paidOrders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        let key, label, fullLabel;
        
        if (chartPeriod === 'day') {
          key = orderDate.toISOString().split('T')[0];
          label = `${orderDate.getDate()}/${orderDate.getMonth() + 1}`;
          fullLabel = orderDate.toLocaleDateString('vi-VN');
        } else if (chartPeriod === 'month') {
          key = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
          label = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          fullLabel = `Tháng ${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
        } else {
          key = orderDate.getFullYear().toString();
          label = key;
          fullLabel = `Năm ${key}`;
        }
        
        if (!groupedData.has(key)) {
          groupedData.set(key, { key, label, fullLabel, value: 0 });
        }
        
        const amount = extractAmountFromOrder(order);
        const dataPoint = groupedData.get(key);
        if (dataPoint) {
          dataPoint.value += amount;
        }
      });
      
      return Array.from(groupedData.values())
        .sort((a, b) => a.key.localeCompare(b.key));
    }
    
    return [];
  }, [dateRange, filteredOrders]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;

  // Tính toán sản phẩm bán chạy
  const topProducts = useMemo(() => {
    const allOrders = extractArrayFromResponse(ordersData);
    const products = extractArrayFromResponse(productsData);
    
    if (!allOrders.length || !products.length) return [];
    
    const productSales = new Map<string, number>();
    
    // Tính tổng số lượng đã bán cho mỗi sản phẩm từ các đơn hàng đã hoàn thành
    allOrders
      .filter(isRevenueOrder)
      .forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.productId?._id || item.productId;
            if (productId) {
              const currentSold = productSales.get(productId) || 0;
              productSales.set(productId, currentSold + (item.quantity || 0));
            }
          });
        }
      });
    
    // Sắp xếp sản phẩm theo số lượng đã bán
    return products
      .map((product: any) => ({
        ...product,
        soldQuantity: productSales.get(product._id) || 0
      }))
      .sort((a: any, b: any) => b.soldQuantity - a.soldQuantity)
      .slice(0, 4);
  }, [ordersData, productsData]);

  // Tính toán khách hàng tiềm năng
  const { qualifiedUsers, userStats } = useMemo(() => {
    const allOrders = extractArrayFromResponse(ordersData);
    const allUsers = extractArrayFromResponse(usersData);
    
    if (!allOrders.length || !allUsers.length) {
      return { qualifiedUsers: [], userStats: new Map() };
    }
    
    // Calculate user spending from all orders
    const userStatsMap = new Map<string, any>();
    
    // Chỉ tính các đơn hàng đã thanh toán và không bị hủy
    const validOrders = allOrders.filter(isRevenueOrder);
    
    validOrders.forEach((order: any) => {
      const userId = extractUserIdFromOrder(order);
      
      if (userId) {
        const amount = extractAmountFromOrder(order);
        
        if (!userStatsMap.has(userId)) {
          userStatsMap.set(userId, {
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: null
          });
        }
        
        const stats = userStatsMap.get(userId);
        if (stats) {
          stats.totalSpent += amount;
          stats.orderCount += 1;
          stats.lastOrderDate = new Date(order.createdAt);
        }
      }
    });
    
    // Filter out admin users and show all non-admin users (including those who haven't purchased)
    const qualified = allUsers
      .filter((user: any) => user.role !== 'admin')
      .sort((a: any, b: any) => {
        const statsA = userStatsMap.get(a._id)?.totalSpent || 0;
        const statsB = userStatsMap.get(b._id)?.totalSpent || 0;
        return statsB - statsA;
      })
      .slice(0, 4);
    
    return { qualifiedUsers: qualified, userStats: userStatsMap };
  }, [ordersData, usersData]);

  // Debug: Revenue calculation validation
  const revenueOrders = useMemo(() => {
    return filteredOrders.filter(isRevenueOrder);
  }, [filteredOrders]);

  const stats = [
    { 
      title: 'Tổng doanh thu', 
      value: `${totalRevenue.toLocaleString()}₫`, 
      change: '+20%', 
      trend: 'up',
      icon: '💰',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'Đơn hàng', 
      value: totalOrders.toString(), 
      change: '+30%', 
      trend: 'up',
      icon: '📦',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      title: 'Khách hàng', 
      value: totalUsers.toString(), 
      change: '+10%', 
      trend: 'up',
      icon: '👥',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Sản phẩm', 
      value: totalProducts.toString(), 
      change: '+10%', 
      trend: 'up',
      icon: '🛍️',
      color: 'from-purple-500 to-pink-500'
    },
  ];

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng quan hoạt động kinh doanh</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ordersLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className={`rounded-xl shadow-sm p-6 animate-pulse ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className={`h-4 rounded w-1/2 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-6 rounded w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ))
        ) : ordersError ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className={`rounded-xl shadow-sm p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{['Tổng doanh thu', 'Đơn hàng', 'Khách hàng', 'Sản phẩm'][index]}</h3>
                <div className="text-sm font-medium text-red-600">Không thể tải</div>
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>--</div>
            </div>
          ))
        ) : stats.map((stat, index) => (
          <div 
            key={index} 
            className={`rounded-xl shadow-sm p-6 hover:shadow-lg transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            style={{ 
              animationName: 'fadeIn',
              animationDuration: '0.5s',
              animationFillMode: 'both',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-md mr-3 transform hover:scale-110 transition-transform`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</h3>
              </div>
              <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                <span className="mr-1">{stat.trend === 'up' ? '↗' : '↘'}</span>
                {stat.change}
              </div>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} ml-14`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className={`lg:col-span-2 rounded-xl shadow-sm p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Biểu đồ doanh thu
            </h2>
            <div>
            <DatePicker.RangePicker 
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              format="DD/MM/YYYY"
              allowClear={false}
              className={`w-72 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              style={{ 
                borderRadius: '8px',
                boxShadow: isDark ? '0 1px 2px rgba(255, 255, 255, 0.05)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
        </div>
          </div>
          {ordersLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Đang tải dữ liệu...</p>
            </div>
          ) : ordersError ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-red-500">Không thể tải dữ liệu biểu đồ</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Không có dữ liệu</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between space-x-1">
              {chartData.map((item, index) => {
                const heightPercent = Math.max((item.value / maxValue) * 90, 5);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group h-full">
                    <div className="relative flex-1 flex items-end w-full">
                      <div 
                        className={`w-full rounded-t-lg transition-all cursor-pointer shadow-md hover:shadow-lg animate-rise ${isDark ? 'bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' : 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500'}`}
                        style={{ 
                          height: `${heightPercent}%`,
                          animationDelay: `${index * 0.1}s`,
                          animationDuration: '0.5s'
                        }}
                        title={`${item.fullLabel}: ${item.value.toLocaleString()}₫`}
                      ></div>
                      <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg ${isDark ? 'bg-gray-700' : 'bg-gray-800'}`}>
                        {item.value.toLocaleString()}₫
                      </div>
                    </div>
                    <span className={`text-xs text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className={`rounded-xl shadow-sm p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {(() => {
              if (productsLoading || ordersLoading) {
                return <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Đang tải...</div>;
              }
              
              return topProducts?.length > 0 ? (
                topProducts.map((product: any) => (
                  <div key={product._id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} hover:shadow-md`}>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name || 'Không có tên'}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {product.categoryId?.name || 'Chưa phân loại'} • Đã bán: {product.soldQuantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(product.price || 0).toLocaleString()}₫</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Không có sản phẩm</div>
              );
            })()
            }
            </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className={`mt-8 rounded-xl shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`p-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Khách hàng tiềm năng</h2>
            <button 
              onClick={() => setShowAllUsers(true)}
              className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              Xem tất cả
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              if (usersLoading || ordersLoading) {
                return <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Đang tải...</div>;
              }
              
              return qualifiedUsers.length > 0 ? (
                qualifiedUsers.map((user: any) => {
                  const stats = userStats.get(user._id);
                  
                  return (
                    <div key={user._id} className={`rounded-lg p-4 hover:shadow-lg transition-all ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'}`}>
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md transform hover:scale-105 transition-transform">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.fullName || user.name || 'Khách hàng'}</h3>
                          <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng đơn hàng:</span>
                          <span className="font-semibold text-blue-600">{stats?.orderCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chi tiêu:</span>
                          <span className="font-semibold text-green-600">{(stats?.totalSpent || 0).toLocaleString()}₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SĐT:</span>
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.phone || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className={`mt-3 pt-3 ${isDark ? 'border-t border-gray-600' : 'border-t border-blue-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mức độ:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (stats?.totalSpent || 0) >= 5000000 ? `${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}` :
                            (stats?.totalSpent || 0) >= 1000000 ? `${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}` :
                            `${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`
                          }`}>
                            {(stats?.totalSpent || 0) >= 5000000 ? 'VIP' : (stats?.totalSpent || 0) >= 1000000 ? 'Tiềm năng' : 'Khách hàng'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chưa có khách hàng tiềm năng</div>
              );
            })()
            }
          </div>
        </div>
      </div>

      <Modal
        title="Tất cả khách hàng"
        open={showAllUsers}
        onCancel={() => setShowAllUsers(false)}
        footer={null}
        width={1200}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {extractArrayFromResponse(usersData)
            .filter((user: any) => user.role !== 'admin')
            .sort((a: any, b: any) => {
              const statsA = userStats.get(a._id)?.totalSpent || 0;
              const statsB = userStats.get(b._id)?.totalSpent || 0;
              return statsB - statsA;
            })
            .map((user: any) => {
              const stats = userStats.get(user._id);
              
              return (
                <div key={user._id} className={`rounded-lg p-4 hover:shadow-lg transition-all ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'}`}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className={`font-semibold truncate text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.fullName || user.name || 'Khách hàng'}</h3>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Đơn hàng:</span>
                      <span className="font-semibold text-blue-600 text-xs">{stats?.orderCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chi tiêu:</span>
                      <span className="font-semibold text-green-600 text-xs">{(stats?.totalSpent || 0).toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SĐT:</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.phone || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className={`mt-2 pt-2 ${isDark ? 'border-t border-gray-600' : 'border-t border-blue-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mức độ:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (stats?.totalSpent || 0) >= 5000000 ? `${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}` :
                        (stats?.totalSpent || 0) >= 1000000 ? `${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}` :
                        `${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`
                      }`}>
                        {(stats?.totalSpent || 0) >= 5000000 ? 'VIP' : (stats?.totalSpent || 0) >= 1000000 ? 'Tiềm năng' : 'Khách hàng'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;