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
          
          <!-- 推荐相似人员区域 -->
          <a-card v-if="showRecommended && recommendedList.length > 0" class="recommend-card mb-4" :bodyStyle="{ padding: '16px' }">
            <template #title>
              <span class="text-blue-500 font-medium">推荐相似人员</span>
            </template>
            <div class="recommend-list">
              <div 
                v-for="person in recommendedList" 
                :key="person.id" 
                class="recommend-card-item"
              >
                <div class="match-score">{{ person.matchScore }}%匹配</div>
                <div class="card-clickable" @click="handleRecommendClick(person)">
                  <a-avatar :src="person.photo || undefined" :size="80" shape="square" class="person-avatar">
                    {{ person.name?.charAt(0) }}
                  </a-avatar>
                  <div class="person-name">{{ person.name }}</div>
                  <div class="ability-tags">
                    <a-tag v-if="person.ability?.leadershipAbility" color="blue">
                      领导能力 {{ person.ability.leadershipAbility }}
                    </a-tag>
                    <a-tag v-if="person.ability?.teamworkAbility" color="cyan">
                      团队合作 {{ person.ability.teamworkAbility }}
                    </a-tag>
                  </div>
                </div>
                <a-button type="link" size="small" class="similar-btn" @click.stop="handleRecommendSimilarClick(person)">
                  查看相似人员
                </a-button>
              </div>
            </div>
          </a-card>
          
          <div class="results-grid">
            <a-spin :spinning="loading" style="width: 100%; min-height: 200px;">
              <div v-if="dataSource.length > 0" class="grid-wrapper">
                <PersonnelCard
                  v-for="item in dataSource"
                  :key="item.id"
                  :personnel="item"
                  @click="handleCardClick(item)"
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

    <!-- 人员详情抽屉 -->
    <PersonnelDetailDrawer
      v-model:open="detailDrawerVisible"
      :personnel="detailPersonnel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { personnelApi, categoryApi, tagApi } from '@/api'
import type { Personnel, Category, Tag } from '@/types'
import PersonnelCard from '@/components/PersonnelCard/index.vue'
import SimilarPersonnelDrawer from '@/components/SimilarPersonnelDrawer/index.vue'
import PersonnelDetailDrawer from '@/components/PersonnelDetailDrawer/index.vue'

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

// 推荐相似人员
const recommendedList = ref<(Personnel & { matchScore: number })[]>([])

// 筛选面板
const filterCollapsed = ref(false)
const activeFilterKeys = ref(['info', 'category', 'advanced'])

// 相似人员
const similarDrawerVisible = ref(false)
const currentPersonnel = ref<Personnel | null>(null)

// 人员详情
const detailDrawerVisible = ref(false)
const detailPersonnel = ref<Personnel | null>(null)

// 加载推荐相似人员
const loadRecommended = async () => {
  try {
    const res = await personnelApi.getList({ page: 1, pageSize: 50 })
    // 筛选能力较强的人员作为推荐，限制为4个以避免挤压左侧搜索条件
    const allPersonnel = res.data || []
    recommendedList.value = allPersonnel
      .filter(p => p.ability)
      .sort((a, b) => {
        const aScore = Object.values(a.ability || {}).reduce((sum: number, v: any) => sum + (v || 0), 0)
        const bScore = Object.values(b.ability || {}).reduce((sum: number, v: any) => sum + (v || 0), 0)
        return bScore - aScore
      })
      .slice(0, 4)
      .map(p => ({
        ...p,
        matchScore: Math.floor(70 + Math.random() * 30) // 70-100的匹配度
      }))
  } catch (e) {
    console.error(e)
  }
}

// 点击推荐人员
const handleRecommendClick = (person: Personnel) => {
  detailPersonnel.value = person
  detailDrawerVisible.value = true
}

// 点击人员卡片查看详情
const handleCardClick = (person: Personnel) => {
  detailPersonnel.value = person
  detailDrawerVisible.value = true
}

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
  const value = quickSearch.value.trim()
  
  // 如果有输入，判断输入类型并填充到对应字段
  if (value) {
    if (/^1[3-9]\d{9}$/.test(value)) {
      searchParams.phone = value
    } else if (/^\d{15}$|^\d{18}$|^\d{17}(\d|X|x)$/.test(value)) {
      searchParams.idCard = value
    } else {
      searchParams.name = value
    }
  }
  
  // 无论是否有输入都执行搜索（空条件返回全部）
  handleSearch()
}

// 搜索
const handleSearch = async () => {
  loading.value = true
  try {
    // 将数组转换为逗号分隔的字符串，以便mock正确解析
    const params: Record<string, any> = {
      name: searchParams.name,
      idCard: searchParams.idCard,
      phone: searchParams.phone,
      gender: searchParams.gender,
      categoryIds: searchParams.categoryIds.join(','),
      tagIds: searchParams.tagIds.join(','),
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await personnelApi.getList(params)
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

// 推荐人员查看相似人员（只打开相似抽屉，不打开详情）
const handleRecommendSimilarClick = (personnel: Personnel) => {
  currentPersonnel.value = personnel
  similarDrawerVisible.value = true
}

// 是否显示推荐人员（有搜索条件时显示）
const showRecommended = computed(() => {
  return !!(
    searchParams.name ||
    searchParams.idCard ||
    searchParams.phone ||
    searchParams.gender ||
    searchParams.categoryIds.length > 0 ||
    searchParams.tagIds.length > 0
  )
})

onMounted(() => {
  loadBaseData()
  loadRecommended()
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
  
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
  
  .search-header {
    text-align: center;
    margin-bottom: 40px;
    
    @media (max-width: 768px) {
      margin-bottom: 24px;
    }
    
    .search-icon {
      font-size: 64px;
      color: #1890ff;
      margin-bottom: 16px;
      
      @media (max-width: 768px) {
        font-size: 48px;
      }
    }
    
    .search-title {
      font-size: 32px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin: 0;
      
      @media (max-width: 768px) {
        font-size: 24px;
      }
    }
  }
  
  .search-form {
    width: 100%;
    max-width: 900px;
    background: none;
    
    .quick-search-input {
      margin-bottom: 32px;
      
      @media (max-width: 768px) {
        margin-bottom: 16px;
      }
      
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
      
      @media (max-width: 768px) {
        padding: 16px;
      }
      
      .form-item-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .form-label {
          flex-shrink: 0;
          width: 48px;
          color: rgba(0, 0, 0, 0.85);
          font-size: 14px;
          
          @media (max-width: 768px) {
            width: auto;
            margin-bottom: 4px;
          }
        }
        
        .ant-input,
        .ant-select {
          flex: 1;
          
          @media (max-width: 768px) {
            width: 100% !important;
          }
        }
      }
    }
  }
}

.search-results {
  height: 100%;
  overflow: hidden;
  
  .results-layout {
    display: flex;
    height: 100%;
    
    // 平板和手机：上下布局
    @media (max-width: 992px) {
      flex-direction: column;
      overflow-y: auto;
    }
  }
  
  .filter-panel {
    width: 300px;
    background: #fff;
    border-right: 1px solid #f0f0f0;
    transition: width 0.3s ease;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    // 桌面端收起状态：仅显示头部
    &.collapsed {
      width: 56px;
      
      .filter-header {
        padding: 16px 8px;
        justify-content: center;
        
        .filter-title {
          display: none;
        }
        
        .ant-btn {
          padding: 4px 8px;
          font-size: 12px;
        }
      }
    }
    
    // 平板端（768-992px）
    @media (max-width: 992px) {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
      
      &.collapsed {
        width: 100%;
        
        .filter-header {
          padding: 12px 16px;
          justify-content: flex-end;
          
          .filter-title {
            display: none;
          }
          
          .ant-btn {
            padding: 4px 12px;
            font-size: 14px;
          }
        }
      }
    }
    
    // 手机端（<768px）
    @media (max-width: 768px) {
      &.collapsed {
        .filter-header {
          padding: 10px 12px;
        }
      }
    }
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
      
      @media (max-width: 768px) {
        padding: 12px;
      }
      
      .filter-title {
        font-weight: 500;
        white-space: nowrap;
      }
    }
    
    .filter-content {
      padding: 16px;
      padding-top: 6px;
      flex: 1;
      overflow-y: auto;
      
      // 平板端限制最大高度
      @media (max-width: 992px) {
        max-height: 280px;
        flex: none;
      }
      
      @media (max-width: 768px) {
        padding: 12px;
        max-height: 240px;
      }
      
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
          
          @media (max-width: 768px) {
            margin-bottom: 12px;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      
      .filter-actions {
        margin-top: 16px;
        
        @media (max-width: 992px) {
          display: flex;
          gap: 8px;
          
          .ant-btn {
            flex: 1;
            margin-top: 0 !important;
          }
        }
      }
    }
  }
  
  .results-content {
    flex: 1;
    padding: 16px 24px;
    min-width: 0;
    overflow-y: auto;
    
    @media (max-width: 992px) {
      padding: 16px;
      flex: 1;
      overflow-y: visible;
    }
    
    @media (max-width: 768px) {
      padding: 12px;
    }
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      @media (max-width: 992px) {
        margin-bottom: 16px;
      }
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .results-count {
        font-size: 16px;
        font-weight: 500;
        
        @media (max-width: 768px) {
          font-size: 14px;
        }
      }
    }
    
    .recommend-card {
      margin-bottom: 24px;
      
      @media (max-width: 992px) {
        margin-bottom: 16px;
      }
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
      
      .recommend-list {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 8px;
        
        // 平板端横向滚动优化
        @media (max-width: 992px) {
          gap: 12px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        
        @media (max-width: 768px) {
          gap: 10px;
        }
        
        .recommend-card-item {
          flex-shrink: 0;
          width: 160px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          
          @media (max-width: 992px) {
            width: 140px;
            padding: 10px;
          }
          
          @media (max-width: 768px) {
            width: 120px;
            padding: 8px;
          }
          
          &:hover {
            border-color: #1890ff;
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          }
          
          .match-score {
            position: absolute;
            top: 0px;
            right: 3px;
            color: #70B603;
            font-weight: bold;
            font-size: 12px;
            z-index: 10;
            
            @media (max-width: 768px) {
              font-size: 11px;
            }
          }
          
          .card-clickable {
            cursor: pointer;
          }
          
          .person-avatar {
            background: linear-gradient(135deg, #1890ff, #096dd9);
            
            @media (max-width: 992px) {
              width: 64px !important;
              height: 64px !important;
              line-height: 64px !important;
            }
            
            @media (max-width: 768px) {
              width: 56px !important;
              height: 56px !important;
              line-height: 56px !important;
            }
          }
          
          .person-name {
            margin: 8px 0;
            font-size: 16px;
            font-weight: 500;
            
            @media (max-width: 992px) {
              font-size: 14px;
              margin: 6px 0;
            }
            
            @media (max-width: 768px) {
              font-size: 13px;
              margin: 4px 0;
            }
          }
          
          .ability-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            justify-content: center;
            
            :deep(.ant-tag) {
              margin: 0;
              font-size: 10px;
              padding: 0 4px;
            }
            
            @media (max-width: 768px) {
              display: none;
            }
          }
          
          .similar-btn {
            margin-top: 8px;
            padding: 0;
            font-size: 12px;
            
            @media (max-width: 768px) {
              margin-top: 4px;
              font-size: 11px;
            }
          }
        }
      }
    }
    
    .results-grid {
      margin-bottom: 24px;
      
      @media (max-width: 992px) {
        margin-bottom: 16px;
      }
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
      
      .grid-wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        
        // 平板端：3列或2列
        @media (max-width: 992px) {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        
        // 手机端大屏：2列
        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        // 手机端小屏：1列
        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: 8px;
        }
      }
    }
    
    .results-pagination {
      display: flex;
      justify-content: center;
      padding: 16px 0;
      
      @media (max-width: 992px) {
        padding: 12px 0;
      }
      
      @media (max-width: 768px) {
        :deep(.ant-pagination) {
          .ant-pagination-options {
            display: none;
          }
        }
      }
    }
  }
}
</style>
