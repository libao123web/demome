import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限检查组合式函数
 * 提供基于角色和权限代码的细粒度权限控制
 */
export function usePermission() {
  const userStore = useUserStore()

  // 当前用户的所有权限代码
  const permissions = computed<string[]>(() => {
    const roles = userStore.userRoles
    if (!roles || roles.length === 0) return []
    
    // 合并所有角色的权限
    const allPermissions: string[] = []
    roles.forEach(role => {
      if (role.permissions) {
        allPermissions.push(...role.permissions)
      }
    })
    return [...new Set(allPermissions)]
  })

  // 是否是超级管理员（拥有 * 权限）
  const isAdmin = computed(() => permissions.value.includes('*'))

  /**
   * 检查是否拥有指定权限
   */
  function hasPermission(code: string): boolean {
    if (isAdmin.value) return true
    return permissions.value.includes(code)
  }

  /**
   * 检查是否拥有任一权限
   */
  function hasAnyPermission(codes: string[]): boolean {
    if (isAdmin.value) return true
    return codes.some(code => permissions.value.includes(code))
  }

  /**
   * 检查是否拥有所有权限
   */
  function hasAllPermissions(codes: string[]): boolean {
    if (isAdmin.value) return true
    return codes.every(code => permissions.value.includes(code))
  }

  /**
   * 检查是否拥有指定角色
   */
  function hasRole(roleName: string): boolean {
    const roles = userStore.userRoles
    return roles?.some(r => r.name === roleName || r.code === roleName) || false
  }

  return {
    permissions,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole
  }
}
