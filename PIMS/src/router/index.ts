import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      // 首页
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeOutlined' }
      },
      // 人员档案管理
      {
        path: 'personnel',
        name: 'Personnel',
        redirect: '/personnel/input',
        meta: { title: '人员档案查询', icon: 'UserOutlined', permissionPrefix: 'personnel' },
        children: [
          {
            path: 'input',
            name: 'PersonnelInput',
            component: () => import('@/views/Personnel/Input/index.vue'),
            meta: { title: '人员信息管理', permissionPrefix: 'personnel:input' }
          },
          {
            path: 'tags',
            name: 'PersonnelTags',
            component: () => import('@/views/Personnel/Tags/index.vue'),
            meta: { title: '人员标签管理', permissionPrefix: 'personnel:tags' }
          },
          {
            path: 'category',
            name: 'PersonnelCategory',
            component: () => import('@/views/Personnel/Category/index.vue'),
            meta: { title: '人员分类管理', permissionPrefix: 'personnel:category' }
          }
        ]
      },
      // 人员检索
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/Search/index.vue'),
        meta: { title: '人员检索', icon: 'SearchOutlined', permissionPrefix: 'search' }
      },
      // 人员岗位管理
      {
        path: 'position',
        name: 'Position',
        component: () => import('@/views/Position/index.vue'),
        meta: { title: '人员岗位管理', icon: 'ApartmentOutlined', permissionPrefix: 'position' }
      },
      // 用户管理
      {
        path: 'user',
        name: 'UserManagement',
        redirect: '/user/list',
        meta: { title: '用户管理', icon: 'TeamOutlined', permissionPrefix: 'system:user' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/User/index.vue'),
            meta: { title: '用户列表', permissionPrefix: 'system:user' }
          }
        ]
      },
      // 角色管理
      {
        path: 'role',
        name: 'RoleManagement',
        redirect: '/role/list',
        meta: { title: '角色管理', icon: 'SafetyCertificateOutlined', permissionPrefix: 'system:role' },
        children: [
          {
            path: 'list',
            name: 'RoleList',
            component: () => import('@/views/Role/index.vue'),
            meta: { title: '角色列表', permissionPrefix: 'system:role' }
          }
        ]
      }
    ]
  },
  // 403 无权限页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403/index.vue'),
    meta: { title: '无权限', requiresAuth: false }
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || '档案管理系统'} - PIMS`
  
  // 不需要登录的页面
  if (to.meta.requiresAuth === false) {
    next()
    return
  }
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查权限（使用 permissionPrefix）
  const permissionPrefix = to.meta.permissionPrefix as string | undefined
  if (permissionPrefix && !userStore.hasPermissionPrefix(permissionPrefix)) {
    message.error('您没有访问该页面的权限')
    next('/403')
    return
  }
  
  next()
})

export default router
