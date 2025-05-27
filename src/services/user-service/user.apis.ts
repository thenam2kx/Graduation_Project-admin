import axios from '@/config/axios.customize'
// Write functions to call APIs here

export const getUserList = (
  { current = 1, pageSize = 10, params = '' }: { current: number; pageSize: number; params?: string }
) => {
  return axios.get(`/api/v1/users?current=${current}&pageSize=${pageSize}&${params || ''}`)
}

export const createUser = (data: IUserFormData) => {
  return axios.post<IBackendResponse<IResponseList<IUser>>>('/api/v1/users', data)
}

export const updateUser = (id: string, data: IUserFormData) => {
  return axios.patch(`/api/v1/users/${id}`, { ...data })
}

export const updateUserStatus = (id: string, status: boolean) => {
  return axios.patch(`/api/v1/users/${id}/status`, { status })
}

export const deleteUser = (id: string) => {
  return axios.delete(`/api/v1/users/${id}`)
}
