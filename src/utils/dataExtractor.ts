/**
 * Utility functions để trích xuất dữ liệu từ các cấu trúc API response khác nhau
 */

/**
 * Trích xuất mảng dữ liệu từ API response với nhiều cấu trúc khác nhau
 * @param data - Dữ liệu từ API response
 * @returns Mảng dữ liệu hoặc mảng rỗng
 */
export const extractArrayFromResponse = (data: any): any[] => {
  if (!data) return [];
  
  // Kiểm tra các cấu trúc phổ biến
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  
  if (data.data?.results && Array.isArray(data.data.results)) {
    return data.data.results;
  }
  
  if (Array.isArray(data.data)) {
    return data.data;
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
};

/**
 * Trích xuất metadata từ API response
 * @param data - Dữ liệu từ API response
 * @returns Metadata object hoặc default values
 */
export const extractMetaFromResponse = (data: any) => {
  const defaultMeta = {
    current: 1,
    pageSize: 10,
    pages: 1,
    total: 0
  };
  
  if (!data) return defaultMeta;
  
  if (data.meta) {
    return { ...defaultMeta, ...data.meta };
  }
  
  if (data.data?.meta) {
    return { ...defaultMeta, ...data.data.meta };
  }
  
  // Nếu có results, tính total từ length
  const results = extractArrayFromResponse(data);
  if (results.length > 0) {
    return {
      ...defaultMeta,
      total: results.length
    };
  }
  
  return defaultMeta;
};

/**
 * Trích xuất user ID từ order object
 * @param order - Order object
 * @returns User ID string hoặc null
 */
export const extractUserIdFromOrder = (order: any): string | null => {
  if (!order) return null;
  
  return order.userId?._id || 
         order.userId || 
         order.user?._id || 
         order.customerId || 
         null;
};

/**
 * Trích xuất amount từ order object
 * @param order - Order object
 * @returns Amount number
 */
export const extractAmountFromOrder = (order: any): number => {
  if (!order) return 0;
  
  return Number(
    order.totalPrice || 
    order.totalAmount || 
    order.total || 
    order.amount || 
    order.price || 
    order.finalAmount || 
    order.grandTotal || 
    order.orderTotal || 
    0
  );
};

/**
 * Kiểm tra xem đơn hàng có được tính vào doanh thu không
 * @param order - Order object
 * @returns Boolean
 */
export const isRevenueOrder = (order: any): boolean => {
  if (!order) return false;
  
  const status = order.status?.toLowerCase();
  const paymentStatus = order.paymentStatus?.toLowerCase();
  const paidStatuses = ['completed', 'delivered', 'paid', 'success'];
  
  return (paidStatuses.includes(status) || paymentStatus === 'paid') && status !== 'cancelled';
};

/**
 * Kiểm tra xem đơn hàng có hợp lệ cho việc tính toán không
 * @param order - Order object
 * @returns Boolean
 */
export const isValidOrder = (order: any): boolean => {
  if (!order) return false;
  
  const status = order.status?.toLowerCase();
  return status !== 'cancelled' && status !== 'refunded';
};