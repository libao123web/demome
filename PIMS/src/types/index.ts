// 人员能力维度
export interface PersonnelAbility {
  leadershipAbility: number      // 领导能力
  teamworkAbility: number        // 团队合作
  communicationAbility: number   // 沟通能力
  managementAbility: number      // 管理技巧
  militaryAbility: number        // 军事能力
  professionalAbility: number    // 专业能力
}

// 人员档案
export interface Personnel {
  id: string
  name: string
  photo?: string
  phone?: string
  gender: 'male' | 'female'
  idCard: string
  idType?: string
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
  militaryRank?: string
  maritalStatus?: string
  ability?: PersonnelAbility  // 新增：能力维度数据
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
  gender?: 'male' | 'female'
  idCard?: string
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

// 相似人员关系
export interface SimilarPersonnel {
  id: string
  name: string
  photo?: string
  similarity: number  // 相似度 0-100
  personnel: Personnel
}

// 关系图节点
export interface GraphNode {
  id: string
  name: string
  photo?: string
  value: number
  symbolSize: number
  category?: number
}

// 关系图连线
export interface GraphLink {
  source: string
  target: string
  value: number  // 相似度
}

