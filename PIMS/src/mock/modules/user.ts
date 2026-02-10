import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { User } from '@/types'

// 用户列表
Mock.mock(/\/api\/user\/list/, 'get', (options: any) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const page = parseInt(params.get('page') || '1')
  const pageSize = parseInt(params.get('pageSize') || '10')
  
  let list = getList<User>(KEYS.USERS).map(({ password, ...u }) => u)
  const total = list.length
  const start = (page - 1) * pageSize
  const data = list.slice(start, start + pageSize)
  
  return { code: 200, data: { data, total }, message: 'success' }
})

// 新增用户
Mock.mock(/\/api\/user\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<User>(KEYS.USERS)
  
  const newItem: User = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime()
  }
  
  list.unshift(newItem)
  saveList(KEYS.USERS, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新用户
Mock.mock(/\/api\/user\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<User>(KEYS.USERS)
  const index = list.findIndex(u => u.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.USERS, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '用户不存在' }
})

// 删除用户
Mock.mock(/\/api\/user\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<User>(KEYS.USERS)
  list = list.filter(u => u.id !== id)
  saveList(KEYS.USERS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
