// 权限树配置
export interface PermissionNode {
  key: string
  title: string
  children?: PermissionNode[]
}

// 完整的权限树配置
export const permissionTree: PermissionNode[] = [
  {
    key: 'personnel',
    title: '人员档案管理',
    children: [
      {
        key: 'personnel:input',
        title: '人员信息录入',
        children: [
          { key: 'personnel:input:view', title: '查看' },
          { key: 'personnel:input:create', title: '新增' },
          { key: 'personnel:input:edit', title: '编辑' },
          { key: 'personnel:input:delete', title: '删除' },
          { key: 'personnel:input:import', title: '导入' },
          { key: 'personnel:input:export', title: '导出' }
        ]
      },
      {
        key: 'personnel:tags',
        title: '标签管理',
        children: [
          { key: 'personnel:tags:view', title: '查看' },
          { key: 'personnel:tags:create', title: '新增' },
          { key: 'personnel:tags:edit', title: '编辑' },
          { key: 'personnel:tags:delete', title: '删除' },
          { key: 'personnel:tags:assign', title: '分配标签' }
        ]
      },
      {
        key: 'personnel:category',
        title: '分类管理',
        children: [
          { key: 'personnel:category:view', title: '查看' },
          { key: 'personnel:category:create', title: '新增' },
          { key: 'personnel:category:edit', title: '编辑' },
          { key: 'personnel:category:delete', title: '删除' }
        ]
      }
    ]
  },
  {
    key: 'search',
    title: '人员检索',
    children: [
      { key: 'search:view', title: '检索查询' },
      { key: 'search:similar', title: '相似人员' },
      { key: 'search:detail', title: '查看详情' },
      { key: 'search:export', title: '导出结果' }
    ]
  },
  {
    key: 'position',
    title: '职务管理',
    children: [
      { key: 'position:view', title: '查看' },
      { key: 'position:create', title: '新增' },
      { key: 'position:edit', title: '编辑' },
      { key: 'position:delete', title: '删除' }
    ]
  },
  {
    key: 'system',
    title: '系统权限管理',
    children: [
      {
        key: 'system:user',
        title: '用户管理',
        children: [
          { key: 'system:user:view', title: '查看' },
          { key: 'system:user:create', title: '新增' },
          { key: 'system:user:edit', title: '编辑' },
          { key: 'system:user:delete', title: '删除' },
          { key: 'system:user:offline', title: '强制下线' },
          { key: 'system:user:resetpwd', title: '重置密码' }
        ]
      },
      {
        key: 'system:role',
        title: '角色管理',
        children: [
          { key: 'system:role:view', title: '查看' },
          { key: 'system:role:create', title: '新增' },
          { key: 'system:role:edit', title: '编辑' },
          { key: 'system:role:delete', title: '删除' },
          { key: 'system:role:assign', title: '分配权限' }
        ]
      },
      {
        key: 'system:permission',
        title: '权限管理',
        children: [
          { key: 'system:permission:view', title: '查看' },
          { key: 'system:permission:assign', title: '分配权限' }
        ]
      },
      {
        key: 'system:log',
        title: '日志管理',
        children: [
          { key: 'system:log:view', title: '查看日志' },
          { key: 'system:log:export', title: '导出日志' },
          { key: 'system:log:delete', title: '删除日志' }
        ]
      }
    ]
  },
  {
    key: 'settings',
    title: '系统配置',
    children: [
      { key: 'settings:view', title: '查看配置' },
      { key: 'settings:edit', title: '修改配置' },
      { key: 'settings:backup', title: '数据备份' },
      { key: 'settings:restore', title: '数据恢复' }
    ]
  }
]

// 获取所有权限的扁平列表（用于快速查找）
export const getAllPermissionKeys = (tree: PermissionNode[] = permissionTree): string[] => {
  const keys: string[] = []
  const traverse = (nodes: PermissionNode[]) => {
    nodes.forEach(node => {
      keys.push(node.key)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return keys
}

// 获取权限名称映射
export const getPermissionMap = (tree: PermissionNode[] = permissionTree): Record<string, string> => {
  const map: Record<string, string> = {}
  const traverse = (nodes: PermissionNode[]) => {
    nodes.forEach(node => {
      map[node.key] = node.title
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return map
}

// 获取权限标签
export const getPermissionLabel = (key: string): string => {
  const map = getPermissionMap()
  return map[key] || key
}
