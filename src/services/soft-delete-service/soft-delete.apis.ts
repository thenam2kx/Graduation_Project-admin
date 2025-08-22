import axiosInstance from '@/config/axios.customize'

export interface SoftDeleteResponse<T = any> {
  statusCode: number
  message: string
  data: {
    meta: {
      current: number
      pageSize: number
      pages: number
      total: number
    }
    results: T[]
  }
}

export const softDeleteApis = {
  getDeletedItems: (model: string, params?: { current?: number; pageSize?: number }) => {
    return axiosInstance.get<SoftDeleteResponse>(`/api/v1/soft-delete/${model}/deleted`, { params })
  },

  restoreItem: (model: string, id: string) => {
    return axiosInstance.patch(`/api/v1/soft-delete/${model}/${id}/restore`)
  },

  forceDeleteItem: (model: string, id: string) => {
    return axiosInstance.delete(`/api/v1/soft-delete/${model}/${id}/force-delete`)
  },

  bulkRestore: (model: string, ids: string[]) => {
    return axiosInstance.patch(`/api/v1/soft-delete/${model}/bulk-restore`, { ids })
  },

  bulkForceDelete: (model: string, ids: string[]) => {
    return axiosInstance.delete(`/api/v1/soft-delete/${model}/bulk-force-delete`, { data: { ids } })
  }
}