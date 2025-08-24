export interface IDiscounts {
  _id: string  
  code: string
  description: string
  type: string
  value: number
  min_order_value: number
  max_discount_amount?: number
  status: string

  startDate: Date
  endDate: Date
  usage_limit: number
  usage_per_user: number
 
}
