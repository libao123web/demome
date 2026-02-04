<template>
  <a-layout class="min-h-screen">
    <!-- 移动端侧边栏抽屉 -->
    <a-drawer
      v-if="appStore.isMobile"
      :open="appStore.siderVisible"
      placement="left"
      :closable="false"
      :width="220"
      @close="appStore.closeSider"
      :bodyStyle="{ padding: 0 }"
    >
      <SiderMenu />
    </a-drawer>

    <!-- PC端侧边栏 -->
    <a-layout-sider
      v-else
      v-model:collapsed="appStore.collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :collapsedWidth="60"
      theme="light"
      class="sider-container"
    >
      <SiderMenu />
    </a-layout-sider>

    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header class="header-container">
        <HeaderBar />
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="content-container">
        <!-- 面包屑 -->
        <BreadcrumbNav />
        
        <!-- 页面内容 -->
        <div class="page-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import SiderMenu from './SiderMenu.vue'
import HeaderBar from './HeaderBar.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'

const appStore = useAppStore()

// 监听窗口大小变化
const handleResize = () => {
  appStore.updateMobile(window.innerWidth < 768)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="less">
.sider-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  
  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 99;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-left: 220px;
  transition: margin-left 0.2s;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 0 16px;
  }
}

.content-container {
  margin-left: 220px;
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.2s;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
}

// 侧边栏折叠时的样式
:global(.ant-layout-sider-collapsed) ~ .ant-layout {
  .header-container,
  .content-container {
    margin-left: 60px;
  }
}

.page-wrapper {
  margin-top: 16px;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
