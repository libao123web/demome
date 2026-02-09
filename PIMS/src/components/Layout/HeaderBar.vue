<template>
  <div class="header-bar">
    <!-- 左侧 -->
    <div class="header-left">
      <!-- 菜单折叠按钮 -->
      <div class="trigger" @click="handleTriggerClick">
        <MenuUnfoldOutlined v-if="appStore.isMobile ? false : appStore.collapsed" />
        <MenuFoldOutlined v-else-if="!appStore.isMobile" />
        <MenuOutlined v-else />
      </div>
      
      <!-- 刷新按钮 -->
      <div class="trigger hidden-xs" @click="handleRefresh">
        <ReloadOutlined :spin="refreshing" />
      </div>
    </div>

    <!-- 右侧 -->
    <div class="header-right">
      <!-- 全屏 -->
      <div class="header-action hidden-xs" @click="toggleFullscreen">
        <FullscreenOutlined v-if="!isFullscreen" />
        <FullscreenExitOutlined v-else />
      </div>

      <!-- 用户信息 -->
      <a-dropdown>
        <div class="user-info">
          <a-avatar :src="userStore.userAvatar" :size="28">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span class="user-name hidden-xs">{{ userStore.userName }}</span>
          <DownOutlined class="hidden-xs" />
        </div>
        <template #overlay>
          <a-menu @click="handleUserMenuClick">
            <a-menu-item key="profile">
              <UserOutlined />
              <span>个人信息</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout">
              <LogoutOutlined />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 个人信息抽屉 -->
    <ProfileDrawer v-model:open="profileVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'ant-design-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import ProfileDrawer from '@/components/ProfileDrawer/index.vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const refreshing = ref(false)
const isFullscreen = ref(false)
const profileVisible = ref(false)

// 触发器点击
const handleTriggerClick = () => {
  if (appStore.isMobile) {
    appStore.toggleSider()
  } else {
    appStore.toggleCollapsed()
  }
}

// 刷新页面
const handleRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    window.location.reload()
  }, 500)
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 用户菜单点击
const handleUserMenuClick = ({ key }: { key: string }) => {
  if (key === 'logout') {
    Modal.confirm({
      title: '提示',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        userStore.logout()
        router.push('/login')
      }
    })
  } else if (key === 'profile') {
    // 打开个人信息抽屉
    profileVisible.value = true
  }
}
</script>

<style scoped lang="less">
.header-bar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  color: rgba(0, 0, 0, 0.65);
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
    color: rgba(0, 0, 0, 0.85);
  }
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-action {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  color: rgba(0, 0, 0, 0.65);
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
    color: rgba(0, 0, 0, 0.85);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  
  .user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
  }
}

.hidden-xs {
  @media (max-width: 576px) {
    display: none !important;
  }
}
</style>
