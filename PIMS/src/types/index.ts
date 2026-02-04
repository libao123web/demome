// 人员档案
export interface Personnel {
  id: string
  name: string
  photo?: string
  phone?: string
  gender: 'male' | 'female'
  idCard: string
  birthDate?: string
  ethnicity?: string
  nativePlace?: string
  politicalStatus?: string
  education?: string
  address?: string
  workplace?: string
  categoryId?: string
  positionId?: string
  tags?: Tag[]
  remark?: string
  createTime?: string
  updateTime?: string
}

// 用户
export interface User {
  id: string
  username: string
  password?: string
  name: string
  avatar?: string
  email?: string
  phone?: string
  roles?: Role[]
  status: 'active' | 'inactive'
  lastLoginTime?: string
  createTime?: string
}

// 角色
export interface Role {
  id: string
  name: string
  code?: string
  description?: string
  permissions?: string[]
  status?: 'active' | 'inactive'
  createTime?: string
}

// 标签
export interface Tag {
  id: string
  name: string
  color?: string
  description?: string
  count?: number
  createTime?: string
}

// 分类
export interface Category {
  id: string
  name: string
  code?: string
  parentId?: string
  sort?: number
  count?: number
  description?: string
  children?: Category[]
  createTime?: string
}

// 职务/岗位
export interface Position {
  id: string
  name: string
  code?: string
  level?: 'senior' | 'middle' | 'junior'
  sort?: number
  description?: string
  status?: 'active' | 'inactive'
  createTime?: string
}

// 登录日志
export interface LoginLog {
  id: string
  userId: string
  userName: string
  loginTime: string
  ip?: string
  device?: string
}

// 分页参数
export interface PageParams {
  page?: number
  pageSize?: number
  [key: string]: any
}

// 分页结果
export interface PageResult<T> {
  data: T[]
  total: number
}

// API 响应
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 权限节点
export interface PermissionNode {
  key: string
  title: string
  children?: PermissionNode[]
}
