export const ORDER_STATUS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipped', label: 'Đã gửi hàng' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'completed', label: 'Đã hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'refunded', label: 'Đã hoàn tiền' }
]
export const getStatusTagColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'default'
    case 'confirmed':
      return 'processing'
    case 'processing':
      return 'cyan'
    case 'shipped':
      return 'blue'
    case 'delivered':
      return 'purple'
    case 'completed':
      return 'green'
    case 'cancelled':
      return 'red'
    case 'refunded':
      return 'orange'
    default:
      return 'default'
  }
}
export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'refunded',
  'cancelled'  
]

export const getShippingMethodLabel = (method: string) => {
  switch (method) {
    case 'standard':
    case 'Giao hàng tiêu chuẩn':
      return 'Giao hàng tiêu chuẩn'
    case 'express':
    case 'Giao hàng nhanh':
      return 'Giao hàng nhanh'
    default:
      return method
  }
}

export const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'cash':
    case 'Thanh toán khi nhận hàng':
      return 'Thanh toán khi nhận hàng'
    case 'momo':
    case 'Thanh toán MoMo':
      return 'Thanh toán MoMo'
    case 'vnpay':
    case 'Thanh toán VNPAY':
      return 'Thanh toán VNPAY'
    default:
      return method
  }
}

export const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'unpaid':
    case 'Chưa thanh toán':
      return 'Chưa thanh toán'
    case 'pending':
    case 'Chờ thanh toán':
      return 'Chờ thanh toán'
    case 'paid':
    case 'Đã thanh toán':
      return 'Đã thanh toán'
    default:
      return status
  }
}


