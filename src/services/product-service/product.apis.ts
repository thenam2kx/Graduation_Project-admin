import axios from '@/config/axios.customize'

export const fetchAllProducts = async (params: string = '') => {
  const url = `/api/v1/products${params}`
  const response = await axios.get<IBackendResponse<IResponseList<IProduct>>>(url)
  return response
}

export const fetchProductById = async (id: string) => {
  const url = `/api/v1/products/${id}`
  const response = await axios.get<IBackendResponse<IProductInitialData>>(url)
  return response
}

export const createProductAPI = async (data: IProductFormData) => {
  try {
    const url = '/api/v1/products'
    const response = await axios.post<IBackendResponse<IProduct>>(url, data)
    return response
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export const updateProductAPI = async (id: string, data: IProductFormData) => {
  try {
    const url = `/api/v1/products/${id}`
    const response = await axios.patch<IBackendResponse<IProduct>>(url, data)
    return response
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export const deleteProductAPI = async (id: string) => {
  const url = `/api/v1/products/${id}`
  const response = await axios.delete<IBackendResponse<IProduct>>(url)
  return response
}

