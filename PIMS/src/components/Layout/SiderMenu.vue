<template>
  <div class="sider-menu">
    <!-- Logo -->
    <div class="logo-container">
      <img src="@/assets/images/logo.svg" alt="Logo" class="logo-img" />
      <span v-if="!appStore.collapsed || appStore.isMobile" class="logo-text">档案管理系统</span>
    </div>

    <!-- 菜单 -->
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      theme="light"
      :inline-collapsed="!appStore.isMobile && appStore.collapsed"
      @click="handleMenuClick"
    >
      <!-- 有子菜单 -->
      <a-sub-menu v-for="menu in menuList.filter(m => m.children?.length)" :key="menu.key">
        <template #icon>
          <component :is="menu.icon" />
        </template>
        <template #title>{{ menu.title }}</template>
        <a-menu-item v-for="child in menu.children" :key="child.key">
          {{ child.title }}
        </a-menu-item>
      </a-sub-menu>
      
      <!-- 无子菜单 -->
      <a-menu-item v-for="menu in menuList.filter(m => !m.children?.length)" :key="menu.key">
        <template #icon>
          <component :is="menu.icon" />
        </template>
        {{ menu.title }}
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  ApartmentOutlined,
  TeamOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 图标组件映射
const iconMap: Record<string, any> = {
  HomeOutlined: h(HomeOutlined),
  UserOutlined: h(UserOutlined),
  SearchOutlined: h(SearchOutlined),
  ApartmentOutlined: h(ApartmentOutlined),
  TeamOutlined: h(TeamOutlined),
  SafetyCertificateOutlined: h(SafetyCertificateOutlined)
}

// 菜单配置
const menuList = computed(() => [
  {
    key: '/dashboard',
    title: '首页',
    icon: iconMap.HomeOutlined
  },
  {
    key: 'personnel',
    title: '人员档案查询',
    icon: iconMap.UserOutlined,
    children: [
      { key: '/personnel/input', title: '人员信息管理' },
      { key: '/personnel/tags', title: '人员标签管理' },
      { key: '/personnel/category', title: '人员分类管理' }
    ]
  },
  {
    key: '/search',
    title: '人员检索',
    icon: iconMap.SearchOutlined
  },
  {
    key: '/position',
    title: '人员岗位管理',
    icon: iconMap.ApartmentOutlined
  },
  {
    key: 'user',
    title: '用户管理',
    icon: iconMap.TeamOutlined,
    children: [
      { key: '/user/list', title: '用户列表' }
    ]
  },
  {
    key: 'role',
    title: '角色管理',
    icon: iconMap.SafetyCertificateOutlined,
    children: [
      { key: '/role/list', title: '角色列表' }
    ]
  }
])

// 选中的菜单
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 根据路由设置选中状态
const setActiveMenu = () => {
  const path = route.path
  selectedKeys.value = [path]
  
  // 设置展开的父级菜单
  menuList.value.forEach(menu => {
    if (menu.children?.some(child => child.key === path)) {
      if (!openKeys.value.includes(menu.key)) {
        openKeys.value.push(menu.key)
      }
    }
  })
}

// 监听路由变化
watch(() => route.path, setActiveMenu, { immediate: true })

// 点击菜单
const handleMenuClick = ({ key }: { key: string }) => {
  if (key.startsWith('/')) {
    router.push(key)
    // 移动端点击后关闭抽屉
    if (appStore.isMobile) {
      appStore.closeSider()
    }
  }
}
</script>

<style scoped lang="less">
.sider-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  
  .logo-img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
  
  .logo-text {
    margin-left: 12px;
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    white-space: nowrap;
  }
}

:deep(.ant-menu) {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  padding: 16px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }
  }
}

:deep(.ant-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 4px 0;
  
  &.ant-menu-item-selected {
    background-color: #e6f7ff;
    
    &::after {
      border-right: 3px solid #1890ff;
    }
  }
  
  .anticon {
    font-size: 14px;
  }
}

:deep(.ant-menu-submenu) {
  .ant-menu-submenu-title {
    height: 40px;
    line-height: 40px;
    margin: 4px 0;
    
    .anticon {
      font-size: 14px;
    }
  }
  
  .ant-menu-sub {
    background: #fafafa;
  }
}
</style>
