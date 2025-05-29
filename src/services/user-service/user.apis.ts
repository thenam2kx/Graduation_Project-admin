import axios from '@/config/axios.customize'
// Write functions to call APIs here
export const getBrandList = (
  { current = 1, pageSize = 10, params = '' }: { current: number; pageSize: number; params?: string }
) => {
  return axios.get(`/api/v1/brand?current=${current}&pageSize=${pageSize}&${params || ''}`)
}