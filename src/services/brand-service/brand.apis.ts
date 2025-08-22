import axios from '@/config/axios.customize'
import { IBrand } from '@/types/brand'

export const fetchAllBrandsAPI = async (params: string = '') => {
  const url = '/api/v1/brand' + params
  return axios.get<IBackendResponse<IResponseList<IBrand>>>(url)
}

export const getAllBrandsAPI = async () => {
  const url = '/api/v1/brand/all'
  return axios.get<IBackendResponse<IBrand[]>>(url)
}

export const fetchTrashBrandsAPI = async (params: string = '') => {
  const url = '/api/v1/brand/trash' + params
  return axios.get<IBackendResponse<IResponseList<IBrand>>>(url)
}

export const restoreBrandAPI = async (id: string) => {
  const url = `/api/v1/brand/restore/${id}`
  return axios.patch<IBackendResponse<IBrand>>(url)
}

export const forceDeleteBrandAPI = async (id: string) => {
  const url = `/api/v1/brand/force-delete/${id}`
  return axios.delete<IBackendResponse<IBrand>>(url)
}
