import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Personnel } from '@/types'

// 人员列表
Mock.mock(/\/api\/personnel\/list/, 'get', (options: any) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const page = parseInt(params.get('page') || '1')
  const pageSize = parseInt(params.get('pageSize') || '10')
  const name = params.get('name') || ''
  const idCard = params.get('idCard') || ''
  const categoryId = params.get('categoryId') || ''
  
  let list = getList<Personnel>(KEYS.PERSONNEL)
  
  // 过滤
  if (name) list = list.filter(p => p.name.includes(name))
  if (idCard) list = list.filter(p => p.idCard.includes(idCard))
  if (categoryId) list = list.filter(p => p.categoryId === categoryId)
  
  const total = list.length
  const start = (page - 1) * pageSize
  const data = list.slice(start, start + pageSize)
  
  return { code: 200, data: { data, total }, message: 'success' }
})

// 新增人员
Mock.mock(/\/api\/personnel\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Personnel>(KEYS.PERSONNEL)
  
  const newItem: Personnel = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime()
  }
  
  list.unshift(newItem)
  saveList(KEYS.PERSONNEL, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新人员
Mock.mock(/\/api\/personnel\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Personnel>(KEYS.PERSONNEL)
  const index = list.findIndex(p => p.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data, updateTime: getCurrentTime() }
    saveList(KEYS.PERSONNEL, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '人员不存在' }
})

// 删除人员
Mock.mock(/\/api\/personnel\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Personnel>(KEYS.PERSONNEL)
  list = list.filter(p => p.id !== id)
  saveList(KEYS.PERSONNEL, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
