import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllProducts } from '@/services/product-service/product.apis';
import { PRODUCT_QUERY_KEYS } from '@/services/product-service/product.key';
import { getUserList } from '@/services/user-service/user.apis';
import axios from '@/config/axios.customize';

const DashboardPage = () => {
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
        return res?.data?.data || null;
      } catch (error) {
        console.error('Error fetching users:', error);
        return null;
      }
    }
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/v1/orderitems?pageSize=100&sort=-createdAt');
        return res?.data?.data || null;
      } catch (error) {
        console.error('Error fetching orders:', error);
        return null;
      }
    }
  });

  const totalProducts = productsData?.meta?.total || 0;
  const totalUsers = usersData?.meta?.total || 0;
  const totalOrders = ordersData?.meta?.total || 0;
  const totalRevenue = ordersData?.results?.reduce((sum: number, order: any) => {
    const price = order?.price || 0;
    const quantity = order?.quantity || 0;
    return sum + (price * quantity);
  }, 0) || 0;

  const stats = [
    { title: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString()}₫`, change: '+12.5%', trend: 'up' },
    { title: 'Đơn hàng', value: totalOrders.toString(), change: '+8.2%', trend: 'up' },
    { title: 'Khách hàng', value: totalUsers.toString(), change: '+15.3%', trend: 'up' },
    { title: 'Sản phẩm', value: totalProducts.toString(), change: '+5.1%', trend: 'up' },
  ];

  const recentOrders = ordersData?.results?.slice(0, 4)?.map((order: any, index: number) => ({
    id: `#${order?._id?.slice(-6) || (12345 + index)}`,
    customer: `Khách hàng ${index + 1}`,
    amount: `${((order?.price || 0) * (order?.quantity || 0)).toLocaleString()}₫`,
    status: order?.deleted ? 'Đã hủy' : 'Hoàn thành',
    date: order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'
  })) || [];

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
            <h2 className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>6 tháng gần đây</option>
              <option>12 tháng gần đây</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 45, 78, 52, 89, 67].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500">
                  T{index + 7}
                </span>
              </div>
            ))}
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

      {/* Recent Orders */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Đang tải...</td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
                        order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Đã giao' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Không có đơn hàng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;