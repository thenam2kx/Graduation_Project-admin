export interface IOrderItem {
  _id: string
  orderId: string
  productId: string
  variantId: string
  quantity: number
  price: number
  reason:string
  createdAt: string
  updatedAt?: string
  deletedAt?: string
  deleted?: boolean
}