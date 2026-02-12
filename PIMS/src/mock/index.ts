import Mock from 'mockjs'
import { getStorage } from '@/utils/storage'
import { KEYS, getList, saveList, getCurrentTime, generateId } from './utils'
import type { User, Personnel, Tag, Category, Role, Position } from '@/types'

// ==================== 初始化默认数据 ====================

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
        permissions: [
          'personnel:input:view',
          'personnel:tags:view',
          'personnel:category:view',
          'search:view',
          'search:detail'
        ], 
        status: 'active',
        description: '普通用户，只有查看权限',
        createTime: getCurrentTime() 
      },
      {
        id: '3',
        name: '人事主管',
        code: 'hr_manager',
        permissions: [
          'personnel:input:view',
          'personnel:input:create',
          'personnel:input:edit',
          'personnel:input:delete',
          'personnel:input:import',
          'personnel:input:export',
          'personnel:tags:view',
          'personnel:tags:create',
          'personnel:tags:edit',
          'personnel:tags:delete',
          'personnel:tags:assign',
          'personnel:category:view',
          'personnel:category:create',
          'personnel:category:edit',
          'personnel:category:delete',
          'search:view',
          'search:similar',
          'search:detail',
          'search:export',
          'position:view',
          'position:create',
          'position:edit',
          'position:delete'
        ],
        status: 'active',
        description: '人事主管，拥有人员管理相关权限',
        createTime: getCurrentTime()
      }
    ]
    saveList(KEYS.ROLES, roles)
  }

  // 初始化用户（密码使用哈希存储）
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
        roles: [roles.find(r => r.code === 'admin')!],
        status: 'active',
        lastLoginTime: getCurrentTime(),
        createTime: getCurrentTime()
      },
      {
        id: '2',
        username: 'user',
        password: '123456',
        name: '普通用户',
        email: 'user@example.com',
        phone: '13800138001',
        roles: [roles.find(r => r.code === 'user')!],
        status: 'active',
        lastLoginTime: getCurrentTime(),
        createTime: getCurrentTime()
      },
      {
        id: '3',
        username: 'hr',
        password: '123456',
        name: '人事主管',
        email: 'hr@example.com',
        phone: '13800138002',
        roles: [roles.find(r => r.code === 'hr_manager')!],
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

  // 初始化人员档案
  // 检查是否需要重新初始化（如果没有数据或数据缺少新的6维ability字段）
  const existingPersonnel = getList<Personnel>(KEYS.PERSONNEL)
  const needsReinit = !existingPersonnel.length || 
    !existingPersonnel[0]?.ability ||
    !existingPersonnel[0]?.ability.leadershipAbility // 检查新字段
  
  if (needsReinit) {
    const categories = getList<Category>(KEYS.CATEGORIES)
    const tags = getList<Tag>(KEYS.TAGS)
    
    const personnel = Mock.mock({
      'list|50': [{
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
        'ability': {
          'leadershipAbility|70-100': 1,
          'teamworkAbility|70-100': 1,
          'communicationAbility|70-100': 1,
          'managementAbility|70-100': 1,
          'militaryAbility|70-100': 1,
          'professionalAbility|70-100': 1
        },
        'remark': '@cparagraph(1, 2)',
        'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
      }]
    }).list
    
    saveList(KEYS.PERSONNEL, personnel)
    console.log('[Mock] Personnel data re-initialized with 6 new ability dimensions (70-100):', personnel[0]?.ability)
  }
}

// 初始化数据
initDefaultData()

// 设置 Mock 延迟
Mock.setup({ timeout: '100-300' })

// ==================== 导入所有 Mock 模块 ====================
import './modules/auth'
import './modules/personnel'
import './modules/user'
import './modules/tag'
import './modules/category'
import './modules/role'
import './modules/position'

console.log('[Mock] Mock.js initialized successfully')
