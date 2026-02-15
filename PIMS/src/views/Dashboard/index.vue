<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="人员总数"
            :value="stats.totalPersonnel"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="分类数量"
            :value="stats.totalCategories"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <FolderOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="标签数量"
            :value="stats.totalTags"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <TagsOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic
            title="用户数量"
            :value="stats.totalUsers"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 内容区域 -->
    <a-row :gutter="[16, 16]" class="mt-4">
      <!-- 快捷入口 -->
      <a-col :xs="24" :md="12">
        <a-card title="快捷入口" class="quick-entry-card">
          <a-row :gutter="[16, 16]">
            <a-col :span="8" v-for="entry in quickEntries" :key="entry.path">
              <div class="entry-item" @click="navigateTo(entry.path)">
                <div class="entry-icon" :style="{ backgroundColor: entry.color }">
                  <component :is="entry.icon" />
                </div>
                <div class="entry-name">{{ entry.name }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- 最近添加 -->
      <a-col :xs="24" :md="12">
        <a-card title="最近添加人员" class="recent-card">
          <template #extra>
            <a-button type="link" @click="navigateTo('/personnel/input')">查看全部</a-button>
          </template>
          <a-list :data-source="recentPersonnel" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar v-if="item.photo" :src="item.photo" />
                    <a-avatar v-else style="background-color: #1890ff">
                      {{ item.name?.charAt(0) }}
                    </a-avatar>
                  </template>
                  <template #title>
                    <span>{{ item.name }}</span>
                    <a-tag v-for="tag in item.tags?.slice(0, 2)" :key="tag.id" :color="tag.color" size="small" class="ml-2">
                      {{ tag.name }}
                    </a-tag>
                  </template>
                  <template #description>
                    {{ item.gender === 'male' ? '男' : '女' }} | {{ item.phone || '未填写电话' }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 分类统计 -->
    <a-row :gutter="[16, 16]" class="mt-4">
      <a-col :xs="24" :md="12">
        <a-card title="分类分布" class="chart-card">
          <div class="category-list">
            <div v-for="cat in categoryStats" :key="cat.id" class="category-item">
              <div class="category-info">
                <span class="category-name">{{ cat.name }}</span>
                <span class="category-count">{{ cat.count }} 人</span>
              </div>
              <a-progress 
                :percent="cat.percent" 
                :show-info="false" 
                :stroke-color="cat.color"
              />
            </div>
            <a-empty v-if="categoryStats.length === 0" description="暂无数据" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
        <a-card title="标签使用情况" class="chart-card">
          <div class="tag-cloud">
            <a-tag 
              v-for="tag in tagStats" 
              :key="tag.id" 
              :color="tag.color"
              class="tag-item"
            >
              {{ tag.name }} ({{ tag.count }})
            </a-tag>
            <a-empty v-if="tagStats.length === 0" description="暂无数据" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 系统信息 -->
    <a-row :gutter="[16, 16]" class="mt-4">
      <a-col :span="24">
        <a-card title="系统信息">
          <a-descriptions :column="{ xs: 1, sm: 2, md: 4 }">
            <a-descriptions-item label="系统名称">档案管理系统</a-descriptions-item>
            <a-descriptions-item label="版本号">v1.0.0</a-descriptions-item>
            <a-descriptions-item label="框架">Vue 3 + Ant Design Vue</a-descriptions-item>
            <a-descriptions-item label="存储方式">LocalStorage</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import {
  TeamOutlined,
  FolderOutlined,
  TagsOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { personnelApi, categoryApi, tagApi, userApi } from '@/api'
import type { Personnel, Category, Tag } from '@/types'

const router = useRouter()
const loading = ref(false)

// 统计数据
const stats = reactive({
  totalPersonnel: 0,
  totalCategories: 0,
  totalTags: 0,
  totalUsers: 0
})

// 最近添加的人员
const recentPersonnel = ref<Personnel[]>([])

// 分类统计
const categoryStats = ref<Array<Category & { count: number; percent: number; color: string }>>([])

// 标签统计
const tagStats = ref<Array<Tag & { count: number }>>([])

// 快捷入口
const quickEntries = [
  { name: '人员录入', path: '/personnel/input', icon: markRaw(PlusOutlined), color: '#1890ff' },
  { name: '人员检索', path: '/search', icon: markRaw(SearchOutlined), color: '#52c41a' },
  { name: '标签管理', path: '/personnel/tags', icon: markRaw(TagsOutlined), color: '#faad14' },
  { name: '分类管理', path: '/personnel/category', icon: markRaw(FolderOutlined), color: '#722ed1' },
  { name: '用户管理', path: '/user', icon: markRaw(UserOutlined), color: '#eb2f96' }
]

// 颜色列表
const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#f5222d', '#fa541c']

// 导航
const navigateTo = (path: string) => {
  router.push(path)
}

// 获取标签字体大小
const getTagFontSize = (count: number): number => {
  const min = 12
  const max = 24
  const maxCount = Math.max(...tagStats.value.map(t => t.count), 1)
  return min + ((count / maxCount) * (max - min))
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载所有数据
    const [personnelRes, categoryRes, tagRes, userRes] = await Promise.all([
      personnelApi.getList({ page: 1, pageSize: 100 }),
      categoryApi.getList(),
      tagApi.getList(),
      userApi.getList({ page: 1, pageSize: 100 })
    ])

    // 更新统计
    stats.totalPersonnel = personnelRes.total
    stats.totalCategories = categoryRes.data.length
    stats.totalTags = tagRes.data.length
    stats.totalUsers = userRes.total

    // 最近添加的人员
    recentPersonnel.value = personnelRes.data.slice(0, 5)

    // 计算分类统计
    const catCounts = new Map<string, number>()
    personnelRes.data.forEach(p => {
      if (p.categoryId) {
        catCounts.set(p.categoryId, (catCounts.get(p.categoryId) || 0) + 1)
      }
    })
    
    const total = personnelRes.total || 1
    categoryStats.value = categoryRes.data.map((cat, index) => ({
      ...cat,
      count: catCounts.get(cat.id) || 0,
      percent: Math.round(((catCounts.get(cat.id) || 0) / total) * 100),
      color: colors[index % colors.length]
    })).sort((a, b) => b.count - a.count).slice(0, 6)

    // 计算标签统计
    const tagCounts = new Map<string, number>()
    personnelRes.data.forEach(p => {
      p.tags?.forEach(tag => {
        tagCounts.set(tag.id, (tagCounts.get(tag.id) || 0) + 1)
      })
    })
    
    tagStats.value = tagRes.data.map(tag => ({
      ...tag,
      count: tagCounts.get(tag.id) || 0
    })).sort((a, b) => b.count - a.count)

  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.dashboard {
  .stat-card {
    border-radius: 2px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }
    
    :deep(.ant-statistic-title) {
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }
    
    :deep(.ant-statistic-content) {
      font-size: 30px;
      font-weight: 600;
    }
    
    :deep(.ant-statistic-content-prefix) {
      margin-right: 8px;
      font-size: 24px;
    }
  }
  
  .quick-entry-card {
    border-radius: 2px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    
    .entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        background: rgba(24, 144, 255, 0.05);
        transform: translateY(-2px);
        
        .entry-icon {
          transform: scale(1.1);
        }
      }
      
      .entry-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28px;
        margin-bottom: 12px;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      .entry-name {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
      }
    }
  }
  
  .recent-card {
    border-radius: 2px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    
    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 24px;
    }
    
    :deep(.ant-card-body) {
      padding: 12px 24px;
    }
    
    :deep(.ant-list-item) {
      padding: 12px 0;
      
      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }
    }
    
    :deep(.ant-list-item-meta-title) {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
    }
    
    :deep(.ant-list-item-meta-description) {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  
  .chart-card {
    min-height: 300px;
    border-radius: 2px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    
    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 24px;
    }
    
    :deep(.ant-card-body) {
      padding: 24px;
    }
    
    .category-list {
      .category-item {
        margin-bottom: 20px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .category-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          .category-name {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.85);
            font-weight: 500;
          }
          
          .category-count {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.45);
          }
        }
        
        :deep(.ant-progress) {
          .ant-progress-bg {
            border-radius: 2px;
          }
        }
      }
    }
    
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      
      .tag-item {
        cursor: pointer;
        padding: 4px 12px;
        border-radius: 2px;
        transition: all 0.3s;
        font-size: 14px;
        
        &:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
    }
  }
}

.mt-4 {
  margin-top: 24px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
