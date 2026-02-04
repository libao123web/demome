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
    login,
    logout,
    updateUser
  }
})
