import axios from 'axios'
import { IOrderItem } from '@/types/orders'
import { store } from '@/redux/store'

export const fetchAllOrdersAPI = async (params?: { page?: number; limit?: number; status?: string; sort?: string }) => {
  try {
    console.log('Calling fetchAllOrdersAPI with params:', params)
    
    // Tạo query parameters với giá trị mặc định
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      sort: params?.sort || '-createdAt',
      ...(params?.status && { status: params.status })
    }
    
    const queryString = new URLSearchParams(queryParams as any).toString()
    const url = `http://localhost:8080/api/v1/orders?${queryString}`
    console.log('API URL:', url)
    
    // Lấy token từ Redux store
    const token = store.getState().auth.access_token
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('API response:', response)
    return response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw error
  }
}

export const fetchOrderByIdAPI = async (orderId: string) => {
  try {
    // Lấy token từ Redux store
    const token = store.getState().auth.access_token
    
    const response = await axios.get(`http://localhost:8080/api/v1/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    throw error
  }
}

export const fetchOrderItemsAPI = async (orderId: string) => {
  try {
    // Lấy token từ Redux store
    const token = store.getState().auth.access_token
    
    const response = await axios.get(`http://localhost:8080/api/v1/orders/${orderId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching order items for ${orderId}:`, error)
    throw error
  }
}

export const updateOrderStatusAPI = async (orderId: string, status: string) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`)
    // Lấy token từ Redux store
    const token = store.getState().auth.access_token
    
    const response = await axios.patch(`http://localhost:8080/api/v1/orders/${orderId}/status`, 
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )
    console.log('Update response:', response)
    return response.data
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error)
    console.error('Error details:', error.response?.data || error.message)
    throw error
  }
}

export const cancelOrderAPI = async (orderId: string, reason?: string) => {
  try {
    console.log(`Cancelling order ${orderId} with reason:`, reason)
    // Lấy token từ Redux store
    const token = store.getState().auth.access_token
    
    const response = await axios.patch(
      `http://localhost:8080/api/v1/orders/${orderId}/cancel`,
      { reason },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )
    console.log('Cancel response:', response)
    return response.data
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error)
    console.error('Error details:', error.response?.data || error.message)
    throw error
  }
}