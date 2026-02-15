import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const collapsed = ref(false)
  
  // 移动端侧边栏显示状态
  const siderVisible = ref(false)
  
  // 是否移动端（包括平板）
  const isMobile = ref(window.innerWidth < 992)

  // 切换折叠状态
  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  // 切换移动端侧边栏
  function toggleSider() {
    siderVisible.value = !siderVisible.value
  }

  // 关闭移动端侧边栏
  function closeSider() {
    siderVisible.value = false
  }

  // 更新移动端状态
  function updateMobile(mobile: boolean) {
    isMobile.value = mobile
    if (!mobile) {
      siderVisible.value = false
    }
  }

  return {
    collapsed,
    siderVisible,
    isMobile,
    toggleCollapsed,
    toggleSider,
    closeSider,
    updateMobile
  }
})
