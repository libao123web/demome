<template>
  <a-breadcrumb class="breadcrumb-nav">
    <a-breadcrumb-item class="ml-[24px]">
      <span class="breadcrumb-label">当前位置：</span>
    </a-breadcrumb-item>
    <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path && (index as number) < breadcrumbs.length - 1" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface BreadcrumbItem {
  title: string
  path?: string
}

// 路由到面包屑映射
const routeMap: Record<string, BreadcrumbItem[]> = {
  '/personnel/input': [
    { title: '人员档案查询', path: '/personnel/input' },
    { title: '人员信息录入' }
  ],
  '/personnel/tags': [
    { title: '人员档案查询', path: '/personnel/input' },
    { title: '人员标签管理' }
  ],
  '/personnel/category': [
    { title: '人员档案查询', path: '/personnel/input' },
    { title: '人员分类管理' }
  ],
  '/search': [
    { title: '人员检索' }
  ],
  '/position': [
    { title: '人员岗位管理' }
  ],
  '/user/list': [
    { title: '用户管理' }
  ],
  '/role/list': [
    { title: '角色管理' }
  ]
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  return routeMap[route.path] || [{ title: route.meta?.title as string || '首页' }]
})
</script>

<style scoped lang="less">
.breadcrumb-nav {
  padding: 16px 0 0;
  margin-bottom: 0px;
  
  :deep(.ant-breadcrumb-link) {
    color: rgba(0, 0, 0, 0.65);
    transition: color 0.3s;
    // margin-left: 24px;
    
    &:hover {
      color: #1890ff;
    }
  }
  
  :deep(.ant-breadcrumb-separator) {
    color: rgba(0, 0, 0, 0.45);
  }
  
  .breadcrumb-label {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 0 0;
    margin-bottom: 12px;
    font-size: 13px;
  }
}
</style>
