import Mock from 'mockjs'
import { getStorage, setStorage } from '@/utils/storage'
import type { User, Personnel, Tag, Category, Role, Position } from '@/types'

// 存储键
const KEYS = {
  PERSONNEL: 'pims_personnel',
  USERS: 'pims_users',
  TAGS: 'pims_tags',
  CATEGORIES: 'pims_categories',
  ROLES: 'pims_roles',
  POSITIONS: 'pims_positions'
}

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 获取当前时间
const getCurrentTime = (): string => {
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
function getList<T>(key: string): T[] {
  const data = getStorage(key)
  return data ? JSON.parse(data) : []
}

// 保存列表到存储
function saveList<T>(key: string, list: T[]): void {
  setStorage(key, JSON.stringify(list))
}

// 初始化默认数据
function initDefaultData() {
  // 初始化角色
  if (!getStorage(KEYS.ROLES)) {
    const roles: Role[] = [
      { 
        id: '1', 
        name: '管理员', 
        code: 'admin',
        permissions: ['*'], 
        status: 'active',
        description: '系统管理员，拥有所有权限',
        createTime: getCurrentTime() 
      },
      { 
        id: '2', 
        name: '普通用户', 
        code: 'user',
        permissions: ['personnel:list', 'search:view'], 
        status: 'active',
        description: '普通用户，只有查看权限',
        createTime: getCurrentTime() 
      }
    ]
    saveList(KEYS.ROLES, roles)
  }

  // 初始化用户
  if (!getStorage(KEYS.USERS)) {
    const roles = getList<Role>(KEYS.ROLES)
    const users: User[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        name: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        roles: [roles[0]],
        status: 'active',
        lastLoginTime: getCurrentTime(),
        createTime: getCurrentTime()
      }
    ]
    saveList(KEYS.USERS, users)
  }

  // 初始化标签
  if (!getStorage(KEYS.TAGS)) {
    const tags: Tag[] = [
      { id: '1', name: '重点人员', color: '#f50', count: 5, createTime: getCurrentTime() },
      { id: '2', name: '优秀人才', color: '#87d068', count: 10, createTime: getCurrentTime() },
      { id: '3', name: '待培养', color: '#2db7f5', count: 8, createTime: getCurrentTime() }
    ]
    saveList(KEYS.TAGS, tags)
  }

  // 初始化分类
  if (!getStorage(KEYS.CATEGORIES)) {
    const categories: Category[] = [
      { id: '1', name: '在职人员', sort: 1, count: 0, createTime: getCurrentTime() },
      { id: '2', name: '离职人员', sort: 2, count: 0, createTime: getCurrentTime() },
      { id: '3', name: '实习生', sort: 3, count: 0, createTime: getCurrentTime() }
    ]
    saveList(KEYS.CATEGORIES, categories)
  }

  // 初始化职务
  if (!getStorage(KEYS.POSITIONS)) {
    const positions: Position[] = [
      { id: '1', name: '经理', code: 'manager', level: 'senior', sort: 1, status: 'active', createTime: getCurrentTime() },
      { id: '2', name: '主管', code: 'supervisor', level: 'middle', sort: 2, status: 'active', createTime: getCurrentTime() },
      { id: '3', name: '专员', code: 'specialist', level: 'junior', sort: 3, status: 'active', createTime: getCurrentTime() }
    ]
    saveList(KEYS.POSITIONS, positions)
  }

  // 初始化人员数据
  if (!getStorage(KEYS.PERSONNEL)) {
    const tags = getList<Tag>(KEYS.TAGS)
    const categories = getList<Category>(KEYS.CATEGORIES)
    
    const personnel: Personnel[] = Mock.mock({
      'list|15': [{
        'id': () => generateId(),
        'name': '@cname',
        'phone': /^1[3-9]\d{9}$/,
        'gender|1': ['male', 'female'],
        'idCard': /^\d{6}(19|20)\d{9}[0-9X]$/,
        'birthDate': '@date("yyyy-MM-dd")',
        'ethnicity|1': ['汉族', '满族', '回族', '藏族', '蒙古族'],
        'nativePlace': '@city',
        'politicalStatus|1': ['党员', '团员', '群众'],
        'education|1': ['博士', '硕士', '本科', '专科', '高中'],
        'address': '@county(true)',
        'workplace': '@ctitle(5, 10)公司',
        'categoryId': () => categories[Math.floor(Math.random() * categories.length)].id,
        'tags': () => {
          const count = Math.floor(Math.random() * 2) + 1
          const shuffled = [...tags].sort(() => 0.5 - Math.random())
          return shuffled.slice(0, count)
        },
        'remark': '@cparagraph(1, 2)',
        'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
      }]
    }).list
    
    saveList(KEYS.PERSONNEL, personnel)
  }
}

// 初始化数据
initDefaultData()

// 设置 Mock 延迟
Mock.setup({ timeout: '100-300' })

// ==================== 登录接口 ====================
Mock.mock(/\/api\/login/, 'post', (options: any) => {
  const { username, password } = JSON.parse(options.body)
  const users = getList<User>(KEYS.USERS)
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    user.lastLoginTime = getCurrentTime()
    saveList(KEYS.USERS, users)
    const { password: _, ...userInfo } = user
    return { code: 200, data: userInfo, message: '登录成功' }
  }
  
  return { code: 401, data: null, message: '用户名或密码错误' }
})

// ==================== 人员档案接口 ====================
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

Mock.mock(/\/api\/personnel\/update/, 'post', (options: any) => {
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

Mock.mock(/\/api\/personnel\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Personnel>(KEYS.PERSONNEL)
  list = list.filter(p => p.id !== id)
  saveList(KEYS.PERSONNEL, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

// ==================== 用户接口 ====================
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

Mock.mock(/\/api\/user\/update/, 'post', (options: any) => {
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

Mock.mock(/\/api\/user\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<User>(KEYS.USERS)
  list = list.filter(u => u.id !== id)
  saveList(KEYS.USERS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

// ==================== 标签接口 ====================
Mock.mock(/\/api\/tag\/list/, 'get', () => {
  const list = getList<Tag>(KEYS.TAGS)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

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

Mock.mock(/\/api\/tag\/update/, 'post', (options: any) => {
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

Mock.mock(/\/api\/tag\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Tag>(KEYS.TAGS)
  list = list.filter(t => t.id !== id)
  saveList(KEYS.TAGS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

// ==================== 分类接口 ====================
Mock.mock(/\/api\/category\/list/, 'get', () => {
  const list = getList<Category>(KEYS.CATEGORIES)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

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

Mock.mock(/\/api\/category\/update/, 'post', (options: any) => {
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

Mock.mock(/\/api\/category\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Category>(KEYS.CATEGORIES)
  list = list.filter(c => c.id !== id)
  saveList(KEYS.CATEGORIES, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

// ==================== 角色接口 ====================
Mock.mock(/\/api\/role\/list/, 'get', () => {
  const list = getList<Role>(KEYS.ROLES)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

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

Mock.mock(/\/api\/role\/update/, 'post', (options: any) => {
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

Mock.mock(/\/api\/role\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Role>(KEYS.ROLES)
  list = list.filter(r => r.id !== id)
  saveList(KEYS.ROLES, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

// ==================== 职务接口 ====================
Mock.mock(/\/api\/position\/list/, 'get', () => {
  const list = getList<Position>(KEYS.POSITIONS)
  return { code: 200, data: { data: list, total: list.length }, message: 'success' }
})

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

Mock.mock(/\/api\/position\/update/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Position>(KEYS.POSITIONS)
  const index = list.findIndex(p => p.id === data.id)
  
  if (index > -1) {
    list[index] = { ...list[index], ...data }
    saveList(KEYS.POSITIONS, list)
    return { code: 200, data: list[index], message: '更新成功' }
  }
  
  return { code: 404, data: null, message: '职务不存在' }
})

Mock.mock(/\/api\/position\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let list = getList<Position>(KEYS.POSITIONS)
  list = list.filter(p => p.id !== id)
  saveList(KEYS.POSITIONS, list)
  
  return { code: 200, data: null, message: '删除成功' }
})

console.log('[Mock] Mock.js initialized successfully')
