import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Tag } from '@/types'

// 标签列表
Mock.mock(/\/api\/tag\/list/, 'get', () => {
  const list = getList<Tag>(KEYS.TAGS)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

// 新增标签
Mock.mock(/\/api\/tag\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Tag>(KEYS.TAGS)
  
  const newItem: Tag = {
    ...data,
    id: generateId(),
    count: 0,
    createTime: getCurrentTime()
  }
  
  list.push(newItem)
  saveList(KEYS.TAGS, list)
  
  return { code: 200, data: newItem, message: '添加成功' }
})

// 更新标签
Mock.mock(/\/api\/tag\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Tag>(KEYS.TAGS)
  const index = list.findIndex(t => t.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.TAGS, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '标签不存在' }
})

// 删除标签
Mock.mock(/\/api\/tag\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Tag>(KEYS.TAGS)
  list = list.filter(t => t.id !== id)
  saveList(KEYS.TAGS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})
