import { getStorage, setStorage } from '@/utils/storage'

// 存储键
export const KEYS = {
  PERSONNEL: 'pims_personnel',
  USERS: 'pims_users',
  TAGS: 'pims_tags',
  CATEGORIES: 'pims_categories',
  ROLES: 'pims_roles',
  POSITIONS: 'pims_positions'
}

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 获取当前时间
export const getCurrentTime = (): string => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 从存储获取列表
export function getList<T>(key: string): T[] {
  const data = getStorage(key)
  return data ? JSON.parse(data) : []
}

// 保存列表到存储
export function saveList<T>(key: string, list: T[]): void {
  setStorage(key, JSON.stringify(list))
}
