import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return response
  },
  (error) => {
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 封装 GET 请求
export async function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await request.get<ApiResponse<T>>(url, { params })
  return response.data.data
}

// 封装 POST 请求
export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await request.post<ApiResponse<T>>(url, data, config)
  return response.data.data
}

// 封装 PUT 请求
export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await request.put<ApiResponse<T>>(url, data, config)
  return response.data.data
}

// 封装 PATCH 请求
export async function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await request.patch<ApiResponse<T>>(url, data, config)
  return response.data.data
}

// 封装 DELETE 请求
export async function del<T = any>(url: string): Promise<T> {
  const response = await request.delete<ApiResponse<T>>(url)
  return response.data.data
}

export default request
