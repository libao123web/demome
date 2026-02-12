import Mock from 'mockjs'
import { getList, saveList, generateId } from '../utils'
import type { PositionTag, PageParams } from '@/types'

const KEYS = {
  POSITION_TAG: 'position_tags'
}

// 初始化数据
const initData = () => {
  const existingData = getList<PositionTag>(KEYS.POSITION_TAG)
  if (!existingData || existingData.length === 0) {
    const tags: PositionTag[] = [
      {
        id: 'pt-1',
        name: '技术员',
        description: '负责技术操作和维护工作',
        createTime: Mock.mock('@datetime')
      },
      {
        id: 'pt-2',
        name: '工程师',
        description: '负责工程项目的设计和实施',
        createTime: Mock.mock('@datetime')
      },
      {
        id: 'pt-3',
        name: '主管',
        description: '负责部门日常管理工作',
        createTime: Mock.mock('@datetime')
      },
      {
        id: 'pt-4',
        name: '经理',
        description: '负责部门整体规划和管理',
        createTime: Mock.mock('@datetime')
      },
      {
        id: 'pt-5',
        name: '专员',
        description: '负责专项工作的执行',
        createTime: Mock.mock('@datetime')
      }
    ]
    saveList(KEYS.POSITION_TAG, tags)
  }
}

initData()

// 获取列表
Mock.mock(/\/api\/position-tag\/list/, 'get', (options: any) => {
  const { page = 1, pageSize = 10 } = options.body ? JSON.parse(options.body) : {}
  const list = getList<PositionTag>(KEYS.POSITION_TAG)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    data: {
      list: list.slice(start, end),
      total: list.length
    },
    message: 'success'
  }
})

// 创建
Mock.mock(/\/api\/position-tag\/create/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<PositionTag>(KEYS.POSITION_TAG)
  
  const newTag: PositionTag = {
    id: generateId(),
    name: data.name,
    description: data.description || '',
    createTime: Mock.mock('@datetime'),
    updateTime: Mock.mock('@datetime')
  }
  
  list.push(newTag)
  saveList(KEYS.POSITION_TAG, list)
  
  return {
    code: 200,
    data: newTag,
    message: 'success'
  }
})

// 更新
Mock.mock(/\/api\/position-tag\/update\/(.*)/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<PositionTag>(KEYS.POSITION_TAG)
  
  const index = list.findIndex((item: PositionTag) => item.id === data.id)
  if (index > -1) {
    list[index] = {
      ...list[index],
      name: data.name,
      description: data.description,
      updateTime: Mock.mock('@datetime')
    }
    saveList(KEYS.POSITION_TAG, list)
    
    return {
      code: 200,
      data: list[index],
      message: 'success'
    }
  }
  
  return {
    code: 404,
    data: null,
    message: '岗位标签不存在'
  }
})

// 删除
Mock.mock(/\/api\/position-tag\/delete\/(.*)/, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  const list = getList<PositionTag>(KEYS.POSITION_TAG)
  
  const filteredList = list.filter((item: PositionTag) => item.id !== id)
  saveList(KEYS.POSITION_TAG, filteredList)
  
  return {
    code: 200,
    data: null,
    message: 'success'
  }
})

export {}
