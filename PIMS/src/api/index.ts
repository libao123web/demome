import { get, post, put, del } from './request'
import type { Personnel, User, Tag, Category, Role, Position, PageResult, LoginLog } from '@/types'

// ==================== 登录 ====================
export const authApi = {
  login: (data: { username: string; password: string }) => 
    post<User>('/login', data)
}

// ==================== 人员档案 ====================
export const personnelApi = {
  getList: (params: Record<string, any>) => 
    get<PageResult<Personnel>>('/personnel/list', params),
  
  getDetail: (id: string | number) => 
    get<Personnel>(`/personnel/detail/${id}`),
  
  create: (data: Partial<Personnel>) => 
    post<Personnel>('/personnel/add', data),
  
  update: (id: string | number, data: Partial<Personnel>) => 
    put<Personnel>('/personnel/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/personnel/delete/${id}`),
  
  import: (data: Partial<Personnel>[]) => 
    post<{ count: number }>('/personnel/import', data)
}

// ==================== 用户管理 ====================
export const userApi = {
  getList: (params: Record<string, any>) => 
    get<PageResult<User>>('/user/list', params),
  
  create: (data: Partial<User>) => 
    post<User>('/user/add', data),
  
  update: (id: string | number, data: Partial<User>) => 
    put<User>('/user/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/user/delete/${id}`),
  
  toggleStatus: (id: string | number) => 
    post<User>(`/user/toggle-status/${id}`)
}

// ==================== 标签管理 ====================
export const tagApi = {
  getList: () => 
    get<PageResult<Tag>>('/tag/list'),
  
  create: (data: Partial<Tag>) => 
    post<Tag>('/tag/add', data),
  
  update: (id: string | number, data: Partial<Tag>) => 
    put<Tag>('/tag/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/tag/delete/${id}`),
  
  getPersonnel: (id: string | number) => 
    get<PageResult<Personnel>>(`/tag/personnel/${id}`)
}

// ==================== 分类管理 ====================
export const categoryApi = {
  getList: () => 
    get<PageResult<Category>>('/category/list'),
  
  create: (data: Partial<Category>) => 
    post<Category>('/category/add', data),
  
  update: (id: string | number, data: Partial<Category>) => 
    put<Category>('/category/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/category/delete/${id}`)
}

// ==================== 角色管理 ====================
export const roleApi = {
  getList: () => 
    get<PageResult<Role>>('/role/list'),
  
  create: (data: Partial<Role>) => 
    post<Role>('/role/add', data),
  
  update: (id: string | number, data: Partial<Role>) => 
    put<Role>('/role/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/role/delete/${id}`)
}

// ==================== 岗位/职务管理 ====================
export const positionApi = {
  getList: () => 
    get<PageResult<Position>>('/position/list'),
  
  create: (data: Partial<Position>) => 
    post<Position>('/position/add', data),
  
  update: (id: string | number, data: Partial<Position>) => 
    put<Position>('/position/update', { ...data, id }),
  
  delete: (id: string | number) => 
    del(`/position/delete/${id}`)
}

// ==================== 登录日志 ====================
export const loginLogApi = {
  getList: (params?: { userId?: number }) => 
    get<PageResult<LoginLog>>('/login-log/list', params)
}
