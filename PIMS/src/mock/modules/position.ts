import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Position } from '@/types'

// 岗位列表
Mock.mock(/\/api\/position\/list/, 'get', () => {
  const list = getList<Position>(KEYS.POSITIONS)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

// 新增岗位
Mock.mock(/\/api\/position\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Position>(KEYS.POSITIONS)
  
  const newItem: Position = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime()
  }
  
  list.push(newItem)
  saveList(KEYS.POSITIONS, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新岗位
Mock.mock(/\/api\/position\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Position>(KEYS.POSITIONS)
  const index = list.findIndex(p => p.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.POSITIONS, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '岗位不存在' }
})

// 删除岗位
Mock.mock(/\/api\/position\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Position>(KEYS.POSITIONS)
  list = list.filter(p => p.id !== id)
  saveList(KEYS.POSITIONS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
