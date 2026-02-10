import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Role } from '@/types'

// 角色列表
Mock.mock(/\/api\/role\/list/, 'get', () => {
  const list = getList<Role>(KEYS.ROLES)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

// 新增角色
Mock.mock(/\/api\/role\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Role>(KEYS.ROLES)
  
  const newItem: Role = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime()
  }
  
  list.push(newItem)
  saveList(KEYS.ROLES, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新角色
Mock.mock(/\/api\/role\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Role>(KEYS.ROLES)
  const index = list.findIndex(r => r.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.ROLES, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '角色不存在' }
})

// 删除角色
Mock.mock(/\/api\/role\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Role>(KEYS.ROLES)
  list = list.filter(r => r.id !== id)
  saveList(KEYS.ROLES, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
