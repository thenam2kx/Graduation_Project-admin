import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import axios from 'axios'
import { store } from '@/redux/store'

const SHIPPING_STATUSES = [
  { value: 'ready_to_pick', label: 'Chờ lấy hàng' },
  { value: 'picking', label: 'Đang lấy hàng' },
  { value: 'picked', label: 'Đã lấy hàng' },
  { value: 'delivering', label: 'Đang giao hàng' },
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'delivery_fail', label: 'Giao hàng thất bại' },
  { value: 'waiting_to_return', label: 'Chờ trả hàng' },
  { value: 'return', label: 'Đang trả hàng' },
  { value: 'returned', label: 'Đã trả hàng' },
  { value: 'cancel', label: 'Đã hủy' },
  { value: 'exception', label: 'Ngoại lệ' }
]

interface ShippingSyncProps {
  orderId?: string
  onSuccess?: () => void
}

const ShippingSyncComponent: React.FC<ShippingSyncProps> = ({ orderId: initialOrderId, onSuccess }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '')
  const [statusCode, setStatusCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSyncStatus = async () => {
    if (!orderId || !statusCode) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      const token = store.getState().auth.access_token
      
      const response = await axios.patch(
        `http://localhost:8080/api/v1/shipping/status/${orderId}`,
        {
          statusCode,
          statusName: SHIPPING_STATUSES.find(s => s.value === statusCode)?.label,
          updatedAt: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        toast.success('Đồng bộ trạng thái vận chuyển thành công!')
        onSuccess?.()
        
        // Reset form nếu không có orderId ban đầu
        if (!initialOrderId) {
          setOrderId('')
          setStatusCode('')
        }
      }
    } catch (error: any) {
      console.error('Error syncing shipping status:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đồng bộ trạng thái'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestWebhook = async () => {
    if (!orderId) {
      toast.error('Vui lòng nhập mã đơn hàng')
      return
    }

    setIsLoading(true)
    try {
      // Simulate webhook call với trạng thái delivered
      const token = store.getState().auth.access_token
      
      const response = await axios.patch(
        `http://localhost:8080/api/v1/shipping/status/${orderId}`,
        {
          statusCode: 'delivered',
          statusName: 'Đã giao hàng',
          description: 'Test webhook - Giao hàng thành công',
          updatedAt: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        toast.success('Test webhook thành công! Đơn hàng đã được cập nhật thành "Đã giao hàng"')
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Error testing webhook:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi test webhook'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Đồng bộ trạng thái vận chuyển</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mã đơn hàng</label>
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Nhập mã đơn hàng"
            disabled={!!initialOrderId}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái vận chuyển</label>
          <Select value={statusCode} onValueChange={setStatusCode}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSyncStatus}
            disabled={isLoading || !orderId || !statusCode}
            className="flex-1"
          >
            {isLoading ? 'Đang xử lý...' : 'Cập nhật trạng thái'}
          </Button>
          
          <Button
            onClick={handleTestWebhook}
            disabled={isLoading || !orderId}
            variant="outline"
            className="flex-1"
          >
            Test Webhook
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Lưu ý:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Webhook URL: <code>/api/v1/shipping/status/:orderId</code></li>
            <li>Trạng thái sẽ tự động ánh xạ sang trạng thái đơn hàng</li>
            <li>Thanh toán COD sẽ tự động cập nhật khi giao thành công</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingSyncComponent