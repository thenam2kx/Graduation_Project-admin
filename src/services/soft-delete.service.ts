import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface SoftDeleteItem {
  _id: string
  name?: string
  title?: string
  deletedAt: string
  deletedBy?: string
  [key: string]: any
}

export interface SoftDeleteResponse {
  statusCode: number
  message: string
  data: {
    meta: {
      current: number
      pageSize: number
      pages: number
      total: number
    }
    results: SoftDeleteItem[]
  }
}

export interface BulkActionResponse {
  statusCode: number
  message: string
  data: {
    restored?: number
    deleted?: number
  }
}

export const softDeleteApi = createApi({
  reducerPath: 'softDeleteApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api/v1/debug/soft-delete',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['SoftDelete'],
  endpoints: (builder) => ({
    // Lấy danh sách items đã xóa
    getDeletedItems: builder.query<SoftDeleteResponse, {
      modelName: string
      current?: number
      pageSize?: number
      search?: string
    }>({
      query: ({ modelName, current = 1, pageSize = 10, search }) => {
        const params = new URLSearchParams({
          current: current.toString(),
          pageSize: pageSize.toString()
        })
        if (search) params.append('search', search)
        
        return `${modelName}?${params.toString()}`
      },
      providesTags: (result, error, { modelName }) => [
        { type: 'SoftDelete', id: modelName }
      ]
    }),

    // Khôi phục một item
    restoreItem: builder.mutation<{ message: string }, {
      modelName: string
      id: string
    }>({
      query: ({ modelName, id }) => ({
        url: `${modelName}/${id}/restore`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, { modelName }) => [
        { type: 'SoftDelete', id: modelName }
      ]
    }),

    // Xóa vĩnh viễn một item
    forceDeleteItem: builder.mutation<{ message: string }, {
      modelName: string
      id: string
    }>({
      query: ({ modelName, id }) => ({
        url: `${modelName}/${id}/force-delete`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { modelName }) => [
        { type: 'SoftDelete', id: modelName }
      ]
    }),

    // Khôi phục nhiều items
    bulkRestore: builder.mutation<BulkActionResponse, {
      modelName: string
      ids: string[]
    }>({
      query: ({ modelName, ids }) => ({
        url: `${modelName}/bulk-restore`,
        method: 'PATCH',
        body: { ids }
      }),
      invalidatesTags: (result, error, { modelName }) => [
        { type: 'SoftDelete', id: modelName }
      ]
    }),

    // Xóa vĩnh viễn nhiều items
    bulkForceDelete: builder.mutation<BulkActionResponse, {
      modelName: string
      ids: string[]
    }>({
      query: ({ modelName, ids }) => ({
        url: `${modelName}/bulk-force-delete`,
        method: 'DELETE',
        body: { ids }
      }),
      invalidatesTags: (result, error, { modelName }) => [
        { type: 'SoftDelete', id: modelName }
      ]
    })
  })
})

export const {
  useGetDeletedItemsQuery,
  useRestoreItemMutation,
  useForceDeleteItemMutation,
  useBulkRestoreMutation,
  useBulkForceDeleteMutation
} = softDeleteApi