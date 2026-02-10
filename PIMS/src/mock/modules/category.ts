import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Category } from '@/types'

// 分类列表
Mock.mock(/\/api\/category\/list/, 'get', () => {
  const list = getList<Category>(KEYS.CATEGORIES)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

// 新增分类
Mock.mock(/\/api\/category\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Category>(KEYS.CATEGORIES)
  
  const newItem: Category = {
    ...data,
    id: generateId(),
    count: 0,
    createTime: getCurrentTime()
  }
  
  list.push(newItem)
  saveList(KEYS.CATEGORIES, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新分类
Mock.mock(/\/api\/category\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Category>(KEYS.CATEGORIES)
  const index = list.findIndex(c => c.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.CATEGORIES, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '分类不存在' }
})

// 删除分类
Mock.mock(/\/api\/category\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Category>(KEYS.CATEGORIES)
  list = list.filter(c => c.id !== id)
  saveList(KEYS.CATEGORIES, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
