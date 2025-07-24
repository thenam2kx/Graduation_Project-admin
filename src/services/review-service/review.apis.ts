import { axiosInstance } from '@/lib/axios';

// Lấy tất cả đánh giá với phân trang và lọc
export const fetchAllReviews = async (params?: string) => {
  const url = params ? `/reviews?${params}` : '/reviews';
  const response = await axiosInstance.get(url);
  return response.data;
};

// Lấy đánh giá theo ID sản phẩm
export const fetchReviewsByProduct = async (productId: string, params?: string) => {
  const url = params ? `/reviews/product/${productId}?${params}` : `/reviews/product/${productId}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

// Lấy đánh giá theo ID người dùng
export const fetchReviewsByUser = async (userId: string, params?: string) => {
  const url = params ? `/reviews/user/${userId}?${params}` : `/reviews/user/${userId}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

// Lấy chi tiết đánh giá theo ID
export const fetchReviewDetail = async (reviewId: string) => {
  const response = await axiosInstance.get(`/reviews/${reviewId}`);
  return response.data;
};

// Phê duyệt đánh giá
export const approveReview = async (reviewId: string) => {
  const response = await axiosInstance.patch(`/reviews/${reviewId}/approve`);
  return response.data;
};

// Từ chối đánh giá
export const rejectReview = async (reviewId: string, reason?: string) => {
  const response = await axiosInstance.patch(`/reviews/${reviewId}/reject`, { reason });
  return response.data;
};

// Xóa đánh giá
export const deleteReview = async (reviewId: string) => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Kiểm tra số lần đánh giá của người dùng cho sản phẩm
export const checkUserReviewCount = async (userId: string, productId: string) => {
  const response = await axiosInstance.get(`/reviews/check/${userId}/${productId}`);
  return response.data;
};