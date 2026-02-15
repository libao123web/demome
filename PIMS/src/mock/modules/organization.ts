import Mock from 'mockjs'
import { KEYS, getList, saveList, generateId, getCurrentTime } from '../utils'
import type { Organization, OrganizationMember, Personnel } from '@/types'

// 数据初始化标志
let isInitialized = false

// 确保数据已初始化（惰性初始化，在第一次API调用时执行）
function ensureDataInitialized() {
  if (isInitialized) return
  
  console.log('[Mock Organization] Initializing organization data...')
  
  const existingOrgs = getList<Organization>(KEYS.ORGANIZATIONS)
  
  // 初始化组织架构
  if (existingOrgs.length > 0) {
    // 数据迁移：为旧数据添加 positionTagId
    const needsMigration = existingOrgs.some((org: Organization) => !org.hasOwnProperty('positionTagId'))
    
    if (needsMigration) {
      const migrateOrgs = (orgs: Organization[]): Organization[] => {
        return orgs.map(org => {
          const migratedChildren = org.children ? migrateOrgs(org.children) : undefined
          return {
            ...org,
            positionTagId: org.positionTagId || undefined,
            children: migratedChildren
          }
        })
      }
      
      const migratedOrgs = migrateOrgs(existingOrgs)
      saveList(KEYS.ORGANIZATIONS, migratedOrgs)
    }
  } else {
    // 首次初始化组织架构
    const organizations: Organization[] = [
      {
        id: '1',
        name: '组织A',
        code: 'org-a',
        parentId: '',
        sort: 1,
        positionTagId: 'pt-4',
        memberCount: 40,
        createTime: getCurrentTime(),
        children: [
          { id: '1-1', name: '组织A-A', code: 'org-a-a', parentId: '1', sort: 1, positionTagId: 'pt-2', memberCount: 10, createTime: getCurrentTime() },
          { id: '1-2', name: '组织A-B', code: 'org-a-b', parentId: '1', sort: 2, positionTagId: 'pt-1', memberCount: 10, createTime: getCurrentTime() },
          { id: '1-3', name: '组织A-C', code: 'org-a-c', parentId: '1', sort: 3, positionTagId: 'pt-3', memberCount: 10, createTime: getCurrentTime() },
          { id: '1-4', name: '组织A-G', code: 'org-a-g', parentId: '1', sort: 4, positionTagId: 'pt-5', memberCount: 10, createTime: getCurrentTime() }
        ]
      },
      {
        id: '2',
        name: '组织B',
        code: 'org-b',
        parentId: '',
        sort: 2,
        positionTagId: 'pt-4',
        memberCount: 60,
        createTime: getCurrentTime(),
        children: [
          { id: '2-1', name: '组织B-A', code: 'org-b-a', parentId: '2', sort: 1, positionTagId: 'pt-2', memberCount: 10, createTime: getCurrentTime() },
          { id: '2-2', name: '组织B-B', code: 'org-b-b', parentId: '2', sort: 2, positionTagId: 'pt-1', memberCount: 10, createTime: getCurrentTime() },
          { id: '2-3', name: '组织B-C', code: 'org-b-c', parentId: '2', sort: 3, positionTagId: 'pt-3', memberCount: 10, createTime: getCurrentTime() },
          { id: '2-4', name: '组织B-E', code: 'org-b-e', parentId: '2', sort: 4, positionTagId: 'pt-2', memberCount: 10, createTime: getCurrentTime() },
          { id: '2-5', name: '组织B-F', code: 'org-b-f', parentId: '2', sort: 5, positionTagId: 'pt-1', memberCount: 10, createTime: getCurrentTime() },
          { id: '2-6', name: '组织B-G', code: 'org-b-g', parentId: '2', sort: 6, positionTagId: 'pt-5', memberCount: 10, createTime: getCurrentTime() }
        ]
      }
    ]
    saveList(KEYS.ORGANIZATIONS, organizations)
    console.log('[Mock Organization] Organizations initialized')
  }

  // 初始化组织成员数据
  let existingMembers = getList(KEYS.ORG_MEMBERS)
  const personnel = getList<Personnel>(KEYS.PERSONNEL)
  const personnelIds = personnel.map(p => p.id)
  
  console.log('[Mock Organization] Personnel count:', personnel.length)
  console.log('[Mock Organization] Existing members count:', existingMembers.length)
  
  // 验证现有成员数据中的 personnelId 是否有效
  const hasInvalidRefs = existingMembers.length > 0 && existingMembers.some(
    (m: OrganizationMember) => !personnelIds.includes(m.personnelId)
  )
  
  // 需要重新初始化成员数据的条件
  const needsReinit = 
    (personnel.length > 0 && existingMembers.length === 0) || // 有人员但没有成员数据
    hasInvalidRefs // 有无效的人员引用
  
  if (needsReinit) {
    console.log('[Mock Organization] Re-initializing members due to:', 
      hasInvalidRefs ? 'invalid refs' : 'no members but has personnel')
    
    const members: OrganizationMember[] = []
    const positionNames = ['技术员', '工程师', '主管', '经理', '专员']
    const orgIds = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6']
    
    personnel.forEach((p, index) => {
      members.push({
        id: generateId(),
        organizationId: orgIds[index % orgIds.length],
        personnelId: p.id,
        positionName: positionNames[index % positionNames.length],
        joinTime: getCurrentTime()
      })
    })
    
    saveList(KEYS.ORG_MEMBERS, members)
    console.log('[Mock Organization] Members initialized with', members.length, 'records')
  } else if (existingMembers.length > 0 && personnel.length > existingMembers.length) {
    // 有新增的人员没有入岗,将其入岗
    const assignedPersonnelIds = existingMembers.map((m: OrganizationMember) => m.personnelId)
    const unassignedPersonnel = personnel.filter(p => !assignedPersonnelIds.includes(p.id))
    
    if (unassignedPersonnel.length > 0) {
      const positionNames = ['技术员', '工程师', '主管', '经理', '专员']
      const orgIds = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6']
      
      unassignedPersonnel.forEach((p, index) => {
        existingMembers.push({
          id: generateId(),
          organizationId: orgIds[index % orgIds.length],
          personnelId: p.id,
          positionName: positionNames[index % positionNames.length],
          joinTime: getCurrentTime()
        })
      })
      
      saveList(KEYS.ORG_MEMBERS, existingMembers)
      console.log('[Mock Organization] Added', unassignedPersonnel.length, 'new members')
    }
  }
  
  isInitialized = true
  console.log('[Mock Organization] Initialization completed')
}

// 计算组织的实际成员数量
const calculateMemberCount = (orgId: string): number => {
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  return members.filter(m => m.organizationId === orgId).length
}

// 更新组织树的成员数量
const updateTreeMemberCount = (orgs: Organization[]): Organization[] => {
  return orgs.map(org => {
    const memberCount = calculateMemberCount(org.id)
    const children = org.children ? updateTreeMemberCount(org.children) : undefined
    return { ...org, memberCount, children }
  })
}

// 获取组织树
Mock.mock(/\/api\/organization\/tree/, 'get', () => {
  ensureDataInitialized() // 确保数据已初始化
  const list = getList<Organization>(KEYS.ORGANIZATIONS)
  const updatedList = updateTreeMemberCount(list)
  return { code: 200, data: updatedList, message: 'success' }
})

// 创建组织
Mock.mock(/\/api\/organization\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Organization>(KEYS.ORGANIZATIONS)
  
  const newOrg: Organization = {
    ...data,
    id: generateId(),
    memberCount: 0,
    createTime: getCurrentTime()
  }
  
  // 如果有父级，添加到父级的children中
  if (data.parentId) {
    const addToParent = (orgs: Organization[]): boolean => {
      for (const org of orgs) {
        if (org.id === data.parentId) {
          if (!org.children) org.children = []
          org.children.push(newOrg)
          return true
        }
        if (org.children && addToParent(org.children)) return true
      }
      return false
    }
    addToParent(list)
  } else {
    list.push(newOrg)
  }
  
  saveList(KEYS.ORGANIZATIONS, list)
  return { code: 200, data: newOrg, message: '创建成功' }
})

// 更新组织
Mock.mock(/\/api\/organization\/update/, 'put', (options: any) => {
  const data = JSON.parse(options.body)
  const list = getList<Organization>(KEYS.ORGANIZATIONS)
  
  const updateOrg = (orgs: Organization[]): boolean => {
    for (let i = 0; i < orgs.length; i++) {
      if (orgs[i].id === data.id) {
        orgs[i] = { ...orgs[i], ...data }
        return true
      }
      if (orgs[i].children && updateOrg(orgs[i].children)) return true
    }
    return false
  }
  
  updateOrg(list)
  saveList(KEYS.ORGANIZATIONS, list)
  return { code: 200, data: null, message: '更新成功' }
})

// 删除组织
Mock.mock(/\/api\/organization\/delete\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  const list = getList<Organization>(KEYS.ORGANIZATIONS)
  
  const removeOrg = (orgs: Organization[]): boolean => {
    for (let i = 0; i < orgs.length; i++) {
      if (orgs[i].id === id) {
        orgs.splice(i, 1)
        return true
      }
      if (orgs[i].children && removeOrg(orgs[i].children)) return true
    }
    return false
  }
  
  removeOrg(list)
  saveList(KEYS.ORGANIZATIONS, list)
  return { code: 200, data: null, message: '删除成功' }
})

// 获取组织下的人员
Mock.mock(/\/api\/organization\/members\//, 'get', (options: any) => {
  ensureDataInitialized() // 确保数据已初始化
  const organizationId = options.url.split('/').pop()
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  const personnel = getList<Personnel>(KEYS.PERSONNEL)
  
  // 获取该组织及其子组织的所有成员
  const organizations = getList<Organization>(KEYS.ORGANIZATIONS)
  const getChildOrgIds = (orgs: Organization[], parentId: string): string[] => {
    const ids: string[] = []
    for (const org of orgs) {
      if (org.id === parentId) {
        ids.push(org.id)
        if (org.children) {
          org.children.forEach(child => {
            ids.push(child.id)
            if (child.children) {
              ids.push(...getChildOrgIds(child.children, child.id))
            }
          })
        }
      } else if (org.children) {
        ids.push(...getChildOrgIds(org.children, parentId))
      }
    }
    return ids
  }
  
  const targetOrgIds = organizationId === 'all' 
    ? members.map(m => m.organizationId) 
    : [organizationId]
  
  // 获取组织的岗位标签
  const getOrgPositionTag = (orgId: string): string | undefined => {
    const positionTags = getList<any>(KEYS.POSITION_TAG)
    const findOrg = (orgs: Organization[]): Organization | undefined => {
      for (const org of orgs) {
        if (org.id === orgId) return org
        if (org.children) {
          const found = findOrg(org.children)
          if (found) return found
        }
      }
      return undefined
    }
    
    const org = findOrg(organizations)
    if (org?.positionTagId) {
      const tag = positionTags.find((t: any) => t.id === org.positionTagId)
      return tag?.name
    }
    return undefined
  }
  
  const result = members
    .filter(m => targetOrgIds.includes(m.organizationId))
    .map(m => {
      const positionName = getOrgPositionTag(m.organizationId) || m.positionName
      return {
        ...m,
        positionName,
        personnel: personnel.find(p => p.id === m.personnelId)
      }
    })
  
  return { code: 200, data: result, message: 'success' }
})

// 添加人员到组织
Mock.mock(/\/api\/organization\/member\/add/, 'post', (options: any) => {
  const data = JSON.parse(options.body)
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  
  const newMember: OrganizationMember = {
    id: generateId(),
    organizationId: data.organizationId,
    personnelId: data.personnelId,
    positionName: data.positionName || '员工',
    joinTime: getCurrentTime()
  }
  
  members.push(newMember)
  saveList(KEYS.ORG_MEMBERS, members)
  return { code: 200, data: newMember, message: '添加成功' }
})

// 移除组织成员
Mock.mock(/\/api\/organization\/member\/remove\//, 'delete', (options: any) => {
  const id = options.url.split('/').pop()
  let members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  members = members.filter(m => m.id !== id)
  saveList(KEYS.ORG_MEMBERS, members)
  return { code: 200, data: null, message: '移除成功' }
})

// 单个人员更换组织
Mock.mock(/\/api\/organization\/member\/transfer$/, 'post', (options: any) => {
  const { memberId, targetOrganizationId } = JSON.parse(options.body)
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  
  const member = members.find(m => m.id === memberId)
  if (member) {
    member.organizationId = targetOrganizationId
    saveList(KEYS.ORG_MEMBERS, members)
  }
  
  return { code: 200, data: null, message: '更换成功' }
})

// 批量更换组织
Mock.mock(/\/api\/organization\/member\/batch-transfer/, 'post', (options: any) => {
  const { memberIds, targetOrganizationId } = JSON.parse(options.body)
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  
  members.forEach(m => {
    if (memberIds.includes(m.id)) {
      m.organizationId = targetOrganizationId
    }
  })
  
  saveList(KEYS.ORG_MEMBERS, members)
  return { code: 200, data: null, message: '批量更换成功' }
})

// 获取推荐人员（基于能力匹配）
Mock.mock(/\/api\/organization\/recommended\//, 'get', () => {
  ensureDataInitialized() // 确保数据已初始化
  const personnel = getList<Personnel>(KEYS.PERSONNEL)
  const members = getList<OrganizationMember>(KEYS.ORG_MEMBERS)
  const assignedIds = members.map(m => m.personnelId)
  
  // 返回能力较强的人员
  const recommended = personnel
    .filter(p => p.ability)
    .sort((a, b) => {
      const aScore = Object.values(a.ability || {}).reduce((sum, v) => sum + v, 0)
      const bScore = Object.values(b.ability || {}).reduce((sum, v) => sum + v, 0)
      return bScore - aScore
    })
    .slice(0, 5)
    .map(p => ({
      ...p,
      matchScore: Math.floor(70 + Math.random() * 30) // 70-100的匹配度
    }))
  
  return { code: 200, data: recommended, message: 'success' }
})
