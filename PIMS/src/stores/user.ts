import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'
import type { User } from '@/types'

const CURRENT_USER_KEY = 'pims_current_user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(getStorage(CURRENT_USER_KEY))

  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value)
  const userName = computed(() => currentUser.value?.name || '')
  const userAvatar = computed(() => currentUser.value?.avatar || '')
  const userRoles = computed(() => currentUser.value?.roles || [])
  
  // 用户权限列表（扁平化）
  const userPermissions = computed<string[]>(() => {
    const permissions: string[] = []
    const roles = currentUser.value?.roles || []
    roles.forEach(role => {
      if (role.permissions) {
        permissions.push(...role.permissions)
      }
    })
    return [...new Set(permissions)] // 去重
  })
  
  // 是否为管理员（拥有所有权限）
  const isAdmin = computed(() => userPermissions.value.includes('*'))
  
  // 检查是否拥有某个权限
  function hasPermission(permission: string | string[]): boolean {
    if (isAdmin.value) return true
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.value.includes(p))
    }
    return userPermissions.value.includes(permission)
  }
  
  // 检查是否拥有某个权限前缀（用于菜单显示）
  function hasPermissionPrefix(prefix: string): boolean {
    if (isAdmin.value) return true
    return userPermissions.value.some(p => p.startsWith(prefix))
  }

  // 登录
  function login(user: User) {
    currentUser.value = user
    setStorage(CURRENT_USER_KEY, user)
  }

  // 登出
  function logout() {
    currentUser.value = null
    removeStorage(CURRENT_USER_KEY)
  }

  // 更新用户信息
  function updateUser(data: Partial<User>) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...data }
      setStorage(CURRENT_USER_KEY, currentUser.value)
    }
  }

  return {
    currentUser,
    isLoggedIn,
    userName,
    userAvatar,
    userRoles,
    userPermissions,
    isAdmin,
    hasPermission,
    hasPermissionPrefix,
    login,
    logout,
    updateUser
  }
})
