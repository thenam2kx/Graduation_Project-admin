import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllProducts } from '@/services/product-service/product.apis';
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key';
import { getUserList } from '@/services/user-service/user.apis';
import axios from '@/config/axios.customize';

const DashboardPage = () => {
  const [chartPeriod, setChartPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [chartRange, setChartRange] = useState(6);
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      try {
        const res = await fetchAllProducts('?pageSize=100&sort=-createdAt');
        return res?.data || null;
      } catch (error) {
        console.error('Error fetching products:', error);
        return null;
      }
    }
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await getUserList({ current: 1, pageSize: 100 });
        return res?.data || res || null;
      } catch (error) {
        console.error('Error fetching users:', error);
        return null;
      }
    }
  });

  const totalProducts = productsData?.meta?.total || productsData?.results?.length || 0;
  const totalUsers = usersData?.meta?.total || usersData?.results?.length || 0;
  
  // Calculate mock data based on users
  const mockOrdersPerUser = 8;
  const mockSpendingPerUser = 25000000;
  const totalOrders = totalUsers * mockOrdersPerUser;
  const totalRevenue = totalUsers * mockSpendingPerUser;

  // Generate chart data based on period
  const chartData = useMemo(() => {
    const baseRevenue = totalRevenue / chartRange;
    const data = [];
    
    for (let i = 0; i < chartRange; i++) {
      const variation = 0.7 + Math.random() * 0.6; // Random between 0.7-1.3
      const revenue = baseRevenue * variation;
      const date = new Date();
      
      if (chartPeriod === 'day') {
        date.setDate(date.getDate() - (chartRange - 1 - i));
        data.push({
          label: date.getDate().toString(),
          value: revenue,
          fullLabel: date.toLocaleDateString('vi-VN')
        });
      } else if (chartPeriod === 'month') {
        date.setMonth(date.getMonth() - (chartRange - 1 - i));
        data.push({
          label: `T${date.getMonth() + 1}`,
          value: revenue,
          fullLabel: `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`
        });
      } else {
        date.setFullYear(date.getFullYear() - (chartRange - 1 - i));
        data.push({
          label: date.getFullYear().toString(),
          value: revenue,
          fullLabel: `Năm ${date.getFullYear()}`
        });
      }
    }
    return data;
  }, [chartPeriod, chartRange, totalRevenue]);

  const maxValue = Math.max(...chartData.map(d => d.value));

  const stats = [
    { title: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString()}₫`, change: '+12.5%', trend: 'up' },
    { title: 'Đơn hàng', value: totalOrders.toString(), change: '+8.2%', trend: 'up' },
    { title: 'Khách hàng', value: totalUsers.toString(), change: '+15.3%', trend: 'up' },
    { title: 'Sản phẩm', value: totalProducts.toString(), change: '+5.1%', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="mr-1">
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Doanh thu theo {chartPeriod === 'day' ? 'ngày' : chartPeriod === 'month' ? 'tháng' : 'năm'}
            </h2>
            <div className="flex gap-2">
              <select 
                value={chartPeriod} 
                onChange={(e) => setChartPeriod(e.target.value as 'day' | 'month' | 'year')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
              <select 
                value={chartRange} 
                onChange={(e) => setChartRange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chartPeriod === 'day' && (
                  <>
                    <option value={7}>7 ngày</option>
                    <option value={14}>14 ngày</option>
                    <option value={30}>30 ngày</option>
                  </>
                )}
                {chartPeriod === 'month' && (
                  <>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng</option>
                  </>
                )}
                {chartPeriod === 'year' && (
                  <>
                    <option value={3}>3 năm</option>
                    <option value={5}>5 năm</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.map((item, index) => {
              const heightPercent = Math.max((item.value / maxValue) * 90, 5); // 5-90% of container
              return (
                <div key={index} className="flex-1 flex flex-col items-center group h-full">
                  <div className="relative flex-1 flex items-end w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.fullLabel}: ${item.value.toLocaleString()}₫`}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value.toLocaleString()}₫
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 text-center mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {productsLoading ? (
              <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : productsData?.results?.length > 0 ? (
              productsData.results.slice(0, 4).map((product: any) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{product.name || 'Không có tên'}</div>
                    <div className="text-sm text-gray-500">
                      {product.categoryId?.name || 'Chưa phân loại'} • Tồn kho: {product.stock || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{(product.price || 0).toLocaleString()}₫</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">Không có sản phẩm</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Khách hàng tiềm năng</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usersLoading ? (
              <div className="col-span-full text-center py-8 text-gray-500">Đang tải...</div>
            ) : usersData?.results?.length > 0 ? (
              usersData.results.slice(0, 4).map((user: any, index: number) => {
                const userOrders = Math.floor(Math.random() * 20) + 5;
                const userSpending = Math.floor(Math.random() * 50000000) + 10000000;
                const lastOrder = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
                
                return (
                  <div key={user._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name || 'Khách hàng'}</h3>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng đơn hàng:</span>
                        <span className="font-semibold text-blue-600">{userOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Chi tiêu:</span>
                        <span className="font-semibold text-green-600">{userSpending.toLocaleString()}₫</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Đơn cuối:</span>
                        <span className="text-sm text-gray-500">{lastOrder.toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Mức độ:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userSpending > 30000000 ? 'bg-yellow-100 text-yellow-800' :
                          userSpending > 20000000 ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {userSpending > 30000000 ? 'VIP' : userSpending > 20000000 ? 'Thân thiết' : 'Tiềm năng'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">Không có khách hàng</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;