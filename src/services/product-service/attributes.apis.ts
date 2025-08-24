import axios from '@/config/axios.customize'

export const fetchAllAttributes = async () => {
  const url = `/api/v1/attributes`
  const response = await axios.get<IBackendResponse<IResponseList<IAttributes>>>(url)
  return response
}

export const getTrashAttributes = async (params: { current: number; pageSize: number; qs?: string }) => {
  const url = `/api/v1/attributes/trash`
  const response = await axios.get<IBackendResponse<IResponseList<IAttributes>>>(url, { params })
  return response
}

export const restoreAttribute = async (id: string) => {
  const url = `/api/v1/attributes/restore/${id}`
  const response = await axios.patch<IBackendResponse<IAttributes>>(url)
  return response
}

export const forceDeleteAttribute = async (id: string) => {
  const url = `/api/v1/attributes/force-delete/${id}`
  const response = await axios.delete<IBackendResponse<IAttributes>>(url)
  return response
}

export const attributeApis = {
  fetchAllAttributes,
  getTrashAttributes,
  restoreAttribute,
  forceDeleteAttribute
}
