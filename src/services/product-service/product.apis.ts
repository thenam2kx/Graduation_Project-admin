import axios from '@/config/axios.customize'

export const fetchAllProducts = async (params: string = '') => {
  const url = `/api/v1/products${params}`
  const response = await axios.get<IBackendResponse<IResponseList<IProduct>>>(url)
  return response.data
}

export const fetchProductById = async (id: string) => {
  const url = `/api/v1/products/${id}`
  const response = await axios.get<IBackendResponse<IProduct>>(url)
  return response.data
}

export const createProductAPI = async (data: IProductFormData) => {
  const url = '/api/v1/products'
  const response = await axios.post<IBackendResponse<IProduct>>(url, { ...data })
  return response
}
