export {}

declare global {
  interface IBackendResponse<T> {
    error?: string | string[]
    message: string | string[]
    statusCode: number | string
    data?: T
  }

  interface IResponseList<T>{
    result: T[]
    meta: IMeta
  }
    interface IPagination {
    current: number
    pageSize: number
    total: number
    pages?: number
  }

}
