export interface IDiscounts {
  _id: string  
  code: string
  description: string
  type: string
  value: number
  min_order_value: number
  max_discount_amount?: number
  status: string
  applies_category?: string | string[]
  applies_product?: string | string[]
  applies_variant?: string | string[]
  startDate: Date
  endDate: Date
  usage_limit: number
  usage_per_user: number
 
}
