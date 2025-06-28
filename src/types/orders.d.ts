export interface IUser {
  _id: string
  email: string
  fullName: string
  phone: string
}

export interface IAddressFree {
  _id?: string
  province?: string
  district?: string
  ward?: string
  address?: string
}

export interface IAddress {
  _id: string
  userId: string
  province: string
  district: string
  ward: string
  address: string
  isPrimary: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface IOrder {
  _id: string
  userId: IUser
  addressId: IAddress
  addressFree?: IAddressFree | string
  totalPrice: number
  shippingPrice: number
  discountId?: string | null
  status: string
  statusLabel:  string
  shippingMethod: string
  paymentMethod: string
  paymentStatus:  string
  note: string
  reason:string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface IProductMini {
  _id: string
  name: string
  image: string[]
}

export interface IVariantMini {
  _id: string
  sku: string
}

export interface IOrderItem {
  _id: string
  productId: IProductMini 
  variantId: IVariantMini 
  quantity: number
  price: number
}

export interface IOrderResponse {
  meta: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
  results: IOrder[];
}



