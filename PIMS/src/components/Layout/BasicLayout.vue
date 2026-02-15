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
      :width="236"
      :collapsedWidth="80"
      theme="light"
      class="sider-container"
    >
      <SiderMenu />
    </a-layout-sider>

    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header :class="['header-container', { collapsed: appStore.collapsed }]">
        <HeaderBar />
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content :class="['content-container', { collapsed: appStore.collapsed }]">
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
  appStore.updateMobile(window.innerWidth < 992)
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
  z-index: 99;
  background: #fff;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.035);
  
  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 98;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 256px;
  height: 64px;
  line-height: 64px;
  
  &.collapsed {
    margin-left: 80px;
  }
  
  @media (max-width: 992px) {
    margin-left: 0;
  }
}

.content-container {
  margin-left: 256px;
  min-height: calc(100vh - 64px);
  background: #f0f2f5;
  transition: all 0.2s;
  
  &.collapsed {
    margin-left: 80px;
  }
  
  @media (max-width: 992px) {
    margin-left: 0;
  }
}

.page-wrapper {
  padding: 16px 16px 0;
  
  @media (max-width: 768px) {
    padding: 12px 12px 0;
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
