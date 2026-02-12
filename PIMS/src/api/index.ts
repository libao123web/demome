import { get, post, put, del } from './request'
import type { Personnel, User, Tag, Category, Role, Position, PageResult, LoginLog, Organization, OrganizationMember, PositionTag } from '@/types'

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
    post<{ count: number }>('/personnel/import', data),
  
  // 获取相似人员
  getSimilar: (id: string | number) => 
    get<any[]>(`/personnel/similar/${id}`)
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
    post<User>(`/user/toggle-status/${id}`),
  
  // 强制下线
  forceOffline: (id: string | number) => 
    post<void>(`/user/force-offline/${id}`),
  
  // 重置密码
  resetPassword: (id: string | number, password: string) => 
    post<void>(`/user/reset-password/${id}`, { password })
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

// ==================== 组织架构管理 ====================
export const organizationApi = {
  // 获取组织树
  getTree: () => 
    get<Organization[]>('/organization/tree'),
  
  // 创建组织
  create: (data: Partial<Organization>) => 
    post<Organization>('/organization/add', data),
  
  // 更新组织
  update: (id: string | number, data: Partial<Organization>) => 
    put<Organization>('/organization/update', { ...data, id }),
  
  // 删除组织
  delete: (id: string | number) => 
    del(`/organization/delete/${id}`),
  
  // 获取组织下的人员列表
  getMembers: (organizationId: string) => 
    get<OrganizationMember[]>(`/organization/members/${organizationId}`),
  
  // 添加人员到组织
  addMember: (data: { organizationId: string; personnelId: string; positionName?: string }) => 
    post<OrganizationMember>('/organization/member/add', data),
  
  // 从组织移除人员
  removeMember: (memberId: string) => 
    del(`/organization/member/remove/${memberId}`),
  
  // 更换人员组织（单个）
  transferMember: (data: { memberId: string; targetOrganizationId: string }) => 
    post<void>('/organization/member/transfer', data),
  
  // 批量更换人员组织
  batchTransferMembers: (data: { memberIds: string[]; targetOrganizationId: string }) => 
    post<void>('/organization/member/batch-transfer', data),
  
  // 获取推荐人员（根据能力匹配）
  getRecommendedPersonnel: (organizationId: string) => 
    get<(Personnel & { matchScore: number })[]>(`/organization/recommended/${organizationId}`)
}

// ==================== 登录日志 ====================
export const loginLogApi = {
  getList: (params?: { userId?: number }) => 
    get<PageResult<LoginLog>>('/login-log/list', params)
}

// ==================== 岗位标签 ====================
export const positionTagApi = {
  getList: (params?: PageParams) => 
    get<PageResult<PositionTag>>('/position-tag/list', params),
  
  create: (data: Partial<PositionTag>) => 
    post<PositionTag>('/position-tag/create', data),
  
  update: (id: string, data: Partial<PositionTag>) => 
    put<PositionTag>(`/position-tag/update/${id}`, data),
  
  delete: (id: string) => 
    del<void>(`/position-tag/delete/${id}`)
}
