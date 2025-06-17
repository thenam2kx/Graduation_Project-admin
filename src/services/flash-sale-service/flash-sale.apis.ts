import axios from '@/config/axios.customize'
import { IFlashSale, IFlashSaleItem } from '@/types/flash-sale'

// Flash Sale APIs
export const createFlashSale = async (data: Omit<IFlashSale, '_id'>) => {
  return axios.post('/api/v1/flashsales', data)
}

export const getAllFlashSales = async (params?: { current?: number; pageSize?: number; qs?: string }) => {
  return axios.get('/api/v1/flashsales', { params })
}

export const getFlashSaleById = async (id: string) => {
  return axios.get(`/api/v1/flashsales/${id}`)
}

export const updateFlashSale = async (id: string, data: Partial<IFlashSale>) => {
  return axios.patch(`/api/v1/flashsales/${id}`, data)
}

export const deleteFlashSale = async (id: string) => {
  return axios.delete(`/api/v1/flashsales/${id}`)
}

// Thêm API kích hoạt flash sale
export const activateFlashSale = async (id: string) => {
  return axios.post(`/api/v1/flashsales/${id}/activate`)
}

// Thêm API hủy kích hoạt flash sale
export const deactivateFlashSale = async (id: string) => {
  return axios.post(`/api/v1/flashsales/${id}/deactivate`)
}

// API cho cron jobs
export interface CronJobData {
  flashSaleId: string
  jobType: 'start' | 'end'
  scheduledTime?: string
}

export const createCronJob = async (data: CronJobData) => {
  return axios.post('/api/v1/cron-jobs', data)
}

export const getCronJobs = async () => {
  return axios.get('/api/v1/cron-jobs')
}

export const updateCronJob = async (id: string, data: Partial<CronJobData>) => {
  return axios.patch(`/api/v1/cron-jobs/${id}`, data)
}

export const deleteCronJob = async (id: string) => {
  return axios.delete(`/api/v1/cron-jobs/${id}`)
}

// Flash Sale Item APIs
export const createFlashSaleItem = async (data: Omit<IFlashSaleItem, '_id'>) => {
  return axios.post('/api/v1/flashsales-item', data)
}

export const getFlashSaleItems = async (params?: { flashSaleId?: string; current?: number; pageSize?: number }) => {
  return axios.get('/api/v1/flashsales-item', { params })
}

export const getFlashSaleItemById = async (id: string) => {
  return axios.get(`/api/v1/flashsales-item/${id}`)
}

export const updateFlashSaleItem = async (id: string, data: Partial<IFlashSaleItem>) => {
  return axios.patch(`/api/v1/flashsales-item/${id}`, data)
}

export const deleteFlashSaleItem = async (id: string) => {
  return axios.delete(`/api/v1/flashsales-item/${id}`)
}