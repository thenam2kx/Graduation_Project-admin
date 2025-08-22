export interface IOrderItem {
  _id: string
  orderId: string
  productId: {
    _id: string
    name: string
    capacity?: string
  } | string
  variantId: {
    _id: string
    sku: string
    price: number
    stock: number
    variant_attributes: {
      _id?: string
      variantId: string
      value: string
      attributeId: {
        name: string
        slug: string
        _id: string
      }
    }[]
  } | string
  quantity: number
  price: number
  status: string
  userId: {
    _id: string
    fullName?: string
    name?: string
    email?: string
    phone?: string
  }
  totalPrice: number
  shippingPrice: number
  paymentMethod: string
  paymentStatus: string
  shippingMethod: string
  note?: string
  reason?: string
  addressFree?: {
    receiverName?: string
    receiverPhone?: string
    province?: string
    district?: string
    ward?: string
    address?: string
  }
  shipping?: {
    orderCode?: string
    statusCode?: string
    statusName?: string
  }
  items: {
    productId: {
      _id: string
      name: string
      capacity?: string
    }
    variantId: {
      _id: string
      sku: string
      price: number
      stock: number
      variant_attributes: {
        _id?: string
        variantId: string
        value: string
        attributeId: {
          name: string
          slug: string
          _id: string
        }
      }[]
    }
    quantity: number
    price: number
  }[]
  createdAt: string
  updatedAt?: string
  deletedAt?: string
  deleted?: boolean
}