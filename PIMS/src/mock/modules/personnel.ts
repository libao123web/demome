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
  const phone = params.get('phone') || ''
  const gender = params.get('gender') || ''
  const categoryId = params.get('categoryId') || ''
  const categoryIds = params.get('categoryIds') || '' // 支持数组形式
  const tagIds = params.get('tagIds') || '' // 支持数组形式
  
  let list = getList<Personnel>(KEYS.PERSONNEL)
  
  // 过滤姓名
  if (name) list = list.filter(p => p.name.includes(name))
  // 过滤身份证
  if (idCard) list = list.filter(p => p.idCard.includes(idCard))
  // 过滤手机号
  if (phone) list = list.filter(p => p.phone?.includes(phone))
  // 过滤性别
  if (gender) list = list.filter(p => p.gender === gender)
  // 过滤分类（单个）
  if (categoryId) list = list.filter(p => p.categoryId === categoryId)
  // 过滤分类（数组）
  if (categoryIds) {
    const catIdArr = categoryIds.split(',')
    if (catIdArr.length > 0 && catIdArr[0]) {
      list = list.filter(p => catIdArr.includes(p.categoryId || ''))
    }
  }
  // 过滤标签（数组）
  if (tagIds) {
    const tagIdArr = tagIds.split(',')
    if (tagIdArr.length > 0 && tagIdArr[0]) {
      list = list.filter(p => p.tags?.some(t => tagIdArr.includes(t.id)))
    }
  }
  
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
