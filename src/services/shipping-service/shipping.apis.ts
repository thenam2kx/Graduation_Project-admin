import axios from '@/config/axios.customize'

// Tạo đơn vận chuyển GHN
export const createShippingOrderAPI = async (orderId: string) => {
  const response = await axios.post(`/api/v1/ghn/create-order/${orderId}`)
  return response.data
}

// Lấy trạng thái đơn vận chuyển
export const getShippingStatusAPI = async (orderId: string) => {
  const response = await axios.get(`/api/v1/ghn/order-status/${orderId}`)
  return response.data
}

// Hủy đơn vận chuyển
export const cancelShippingOrderAPI = async (orderId: string, reason: string) => {
  const response = await axios.post(`/api/v1/ghn/cancel-order/${orderId}`, { reason })
  return response.data
}