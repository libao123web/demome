<template>
  <div class="search-page">
    <!-- 初始搜索页面 -->
    <div v-if="searchMode === 'initial'" class="search-initial">
      <div class="search-header">
        <SearchOutlined class="search-icon" />
        <h1 class="search-title">人员检索</h1>
      </div>
      
      <div class="search-form">
        <a-input
          v-model:value="quickSearch"
          size="large"
          placeholder="请输入姓名/证件号/手机号"
          class="quick-search-input"
          @pressEnter="handleQuickSearch"
        >
          <template #suffix>
            <a-button type="primary" @click="handleQuickSearch">查询</a-button>
          </template>
        </a-input>
        
        <div class="advanced-search">
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <div class="form-item-wrapper">
                <label class="form-label">分类：</label>
                <a-select v-model:value="searchParams.categoryIds" mode="multiple" placeholder="请选择" allowClear style="flex: 1">
                  <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="form-item-wrapper">
                <label class="form-label">标签：</label>
                <a-select v-model:value="searchParams.tagIds" mode="multiple" placeholder="请选择" allowClear style="flex: 1">
                  <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
                    {{ tag.name }}
                  </a-select-option>
                </a-select>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>
    
    <!-- 搜索结果页面 -->
    <div v-else class="search-results">
      <div class="results-layout">
        <!-- 左侧筛选面板 -->
        <div class="filter-panel" :class="{ collapsed: filterCollapsed }">
          <div class="filter-header">
            <span class="filter-title">搜索条件</span>
            <a-button type="text" @click="filterCollapsed = !filterCollapsed">
              {{ filterCollapsed ? '展开' : '收起' }}
            </a-button>
          </div>
          
          <div v-if="!filterCollapsed" class="filter-content">
            <a-collapse v-model:activeKey="activeFilterKeys" :bordered="false">
              <a-collapse-panel key="info" header="信息">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                  <a-form-item label="姓名">
                    <a-input v-model:value="searchParams.name" placeholder="请输入" />
                  </a-form-item>
                  <a-form-item label="证件号">
                    <a-input v-model:value="searchParams.idCard" placeholder="请输入" />
                  </a-form-item>
                  <a-form-item label="手机号">
                    <a-input v-model:value="searchParams.phone" placeholder="请输入" />
                  </a-form-item>
                </a-form>
              </a-collapse-panel>
              
              <a-collapse-panel key="category" header="查询方式">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                  <a-form-item label="分类">
                    <a-select v-model:value="searchParams.categoryIds" mode="multiple" placeholder="请选择" allowClear>
                      <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="性别">
                    <a-radio-group v-model:value="searchParams.gender">
                      <a-radio value="">全部</a-radio>
                      <a-radio value="male">男</a-radio>
                      <a-radio value="female">女</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-form>
              </a-collapse-panel>
              
              <a-collapse-panel key="advanced" header="专项筛选">
                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                  <a-form-item label="标签">
                    <a-select v-model:value="searchParams.tagIds" mode="multiple" placeholder="请选择" allowClear>
                      <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
                        {{ tag.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-form>
              </a-collapse-panel>
            </a-collapse>
            
            <div class="filter-actions">
              <a-button type="primary" block @click="handleSearch">查询</a-button>
              <a-button block @click="handleReset" style="margin-top: 8px">重置</a-button>
            </div>
          </div>
        </div>
        
        <!-- 右侧结果列表 -->
        <div class="results-content">
          <div class="results-header">
            <span class="results-count">检索结果 ({{ total }}人)</span>
            <a-button type="link" @click="backToSearch">返回搜索</a-button>
          </div>
          
          <div class="results-grid">
            <a-spin :spinning="loading" style="width: 100%; min-height: 200px;">
              <div v-if="dataSource.length > 0" class="grid-wrapper">
                <PersonnelCard
                  v-for="item in dataSource"
                  :key="item.id"
                  :personnel="item"
                  @similar-click="handleSimilarClick"
                />
              </div>
              <a-empty v-else description="暂无数据" style="margin-top: 100px;" />
            </a-spin>
          </div>
          
          <div v-if="total > 0" class="results-pagination">
            <a-pagination
              v-model:current="pagination.current"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              :show-size-changer="true"
              :show-quick-jumper="true"
              :show-total="(total) => `共 ${total} 条`"
              @change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 相似人员抽屉 -->
    <SimilarPersonnelDrawer
      v-model:open="similarDrawerVisible"
      :personnel="currentPersonnel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { personnelApi, categoryApi, tagApi } from '@/api'
import type { Personnel, Category, Tag } from '@/types'
import PersonnelCard from '@/components/PersonnelCard/index.vue'
import SimilarPersonnelDrawer from '@/components/SimilarPersonnelDrawer/index.vue'

// 搜索模式
const searchMode = ref<'initial' | 'results'>('initial')

// 快速搜索
const quickSearch = ref('')

// 搜索参数
const searchParams = reactive({
  name: '',
  idCard: '',
  phone: '',
  categoryIds: [] as string[],
  gender: '' as '' | 'male' | 'female',
  tagIds: [] as string[]
})

// 基础数据
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// 列表数据
const loading = ref(false)
const dataSource = ref<Personnel[]>([])
const total = ref(0)
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 筛选面板
const filterCollapsed = ref(false)
const activeFilterKeys = ref(['info', 'category', 'advanced'])

// 相似人员
const similarDrawerVisible = ref(false)
const currentPersonnel = ref<Personnel | null>(null)

// 加载基础数据
const loadBaseData = async () => {
  try {
    const [catRes, tagRes] = await Promise.all([
      categoryApi.getList(),
      tagApi.getList()
    ])
    categories.value = catRes.data
    tags.value = tagRes.data
  } catch (e) {
    console.error(e)
  }
}

// 快速搜索
const handleQuickSearch = () => {
  if (!quickSearch.value.trim()) return
  
  // 判断输入类型并填充到对应字段
  const value = quickSearch.value.trim()
  if (/^1[3-9]\d{9}$/.test(value)) {
    searchParams.phone = value
  } else if (/^\d{15}$|^\d{18}$|^\d{17}(\d|X|x)$/.test(value)) {
    searchParams.idCard = value
  } else {
    searchParams.name = value
  }
  
  handleSearch()
}

// 搜索
const handleSearch = async () => {
  loading.value = true
  try {
    const res = await personnelApi.getList({
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    dataSource.value = res.data
    total.value = res.total
    pagination.total = res.total
    searchMode.value = 'results'
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  Object.assign(searchParams, {
    name: '',
    idCard: '',
    phone: '',
    categoryIds: [],
    gender: '',
    tagIds: []
  })
  quickSearch.value = ''
}

// 返回搜索
const backToSearch = () => {
  searchMode.value = 'initial'
  handleReset()
}

// 分页变化
const handlePageChange = () => {
  handleSearch()
}

// 相似人员点击
const handleSimilarClick = (personnel: Personnel) => {
  currentPersonnel.value = personnel
  similarDrawerVisible.value = true
}

onMounted(() => {
  loadBaseData()
})
</script>

<style scoped lang="less">
.search-page {
  // height: calc(100vh - 64px);
  background: #f0f2f5;
  overflow: hidden;
}

.search-initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  overflow: hidden;
  
  .search-header {
    text-align: center;
    margin-bottom: 40px;
    
    .search-icon {
      font-size: 64px;
      color: #1890ff;
      margin-bottom: 16px;
    }
    
    .search-title {
      font-size: 32px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin: 0;
    }
  }
  
  .search-form {
    width: 100%;
    max-width: 900px;
    background: none;
    
    .quick-search-input {
      margin-bottom: 32px;
      
      :deep(.ant-input) {
        padding-right: 80px;
      }
      
      :deep(.ant-input-suffix) {
        right: 4px;
      }
    }
    
    .advanced-search {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      .form-item-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .form-label {
          flex-shrink: 0;
          width: 48px;
          color: rgba(0, 0, 0, 0.85);
          font-size: 14px;
        }
        
        .ant-input,
        .ant-select {
          flex: 1;
        }
      }
    }
  }
}

.search-results {
  
  .results-layout {
    display: flex;
  }
  
  .filter-panel {
    width: 320px;
    background: #fff;
    border-right: 1px solid #f0f0f0;
    transition: all 0.3s;
    
    &.collapsed {
      width: 60px;
    }
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
      
      .filter-title {
        font-weight: 500;
      }
    }
    
    .filter-content {
      padding: 16px;
      padding-top: 6px;
      
      :deep(.ant-collapse) {
        background: transparent;
        border: none;
        
        .ant-collapse-item {
          border-bottom: 1px solid #f0f0f0;
        }
      }
      
      :deep(.ant-form) {
        .ant-form-item {
          margin-bottom: 16px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      
      .filter-actions {
        margin-top: 16px;
      }
    }
  }
  
  .results-content {
    flex: 1;
    padding: 24px;
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      .results-count {
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .results-grid {
      margin-bottom: 24px;
      
      .grid-wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
    }
    
    .results-pagination {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
  }
}
</style>
