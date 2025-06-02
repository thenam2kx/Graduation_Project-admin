import axios from '@/config/axios.customize'

export const signinAPI = (data: { email: string; password: string }) => {
  const url = '/api/v1/auth/signin'
  return axios.post<IBackendResponse<IAuth>>(url, { ...data })
}
