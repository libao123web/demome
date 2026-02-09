<template>
  <div class="search-page">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form :model="searchForm" @finish="handleSearch" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="姓名">
              <a-input v-model:value="searchForm.name" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="身份证号">
              <a-input v-model:value="searchForm.idCard" placeholder="请输入身份证号" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="联系电话">
              <a-input v-model:value="searchForm.phone" placeholder="请输入联系电话" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="性别">
              <a-select v-model:value="searchForm.gender" placeholder="请选择性别" allowClear>
                <a-select-option value="male">男</a-select-option>
                <a-select-option value="female">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="分类">
              <a-select v-model:value="searchForm.categoryId" placeholder="请选择分类" allowClear>
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="标签">
              <a-select v-model:value="searchForm.tagId" placeholder="请选择标签" allowClear>
                <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="政治面貌">
              <a-select v-model:value="searchForm.politicalStatus" placeholder="请选择政治面貌" allowClear>
                <a-select-option value="党员">党员</a-select-option>
                <a-select-option value="团员">团员</a-select-option>
                <a-select-option value="群众">群众</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="学历">
              <a-select v-model:value="searchForm.education" placeholder="请选择学历" allowClear>
                <a-select-option value="博士">博士</a-select-option>
                <a-select-option value="硕士">硕士</a-select-option>
                <a-select-option value="本科">本科</a-select-option>
                <a-select-option value="专科">专科</a-select-option>
                <a-select-option value="高中">高中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <div class="search-actions">
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <ReloadOutlined />
              重置
            </a-button>
            <a-button type="link" @click="toggleAdvanced">
              {{ showAdvanced ? '收起' : '高级搜索' }}
              <DownOutlined :class="{ 'rotate-180': showAdvanced }" />
            </a-button>
          </a-space>
        </div>
        
        <!-- 高级搜索 -->
        <div v-show="showAdvanced" class="advanced-search">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="民族">
                <a-select v-model:value="searchForm.ethnicity" placeholder="请选择民族" allowClear>
                  <a-select-option v-for="e in ethnicities" :key="e" :value="e">{{ e }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="籍贯">
                <a-input v-model:value="searchForm.nativePlace" placeholder="请输入籍贯" allowClear />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="工作单位">
                <a-input v-model:value="searchForm.workplace" placeholder="请输入工作单位" allowClear />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="现住址">
                <a-input v-model:value="searchForm.address" placeholder="请输入现住址" allowClear />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-card>

    <!-- 搜索结果 -->
    <a-card class="result-card">
      <div class="result-header">
        <div class="result-info">
          <span>搜索结果：共 <strong>{{ pagination.total }}</strong> 条记录</span>
        </div>
        <a-space>
          <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
            <a-radio-button value="table">
              <UnorderedListOutlined />
            </a-radio-button>
            <a-radio-button value="card">
              <AppstoreOutlined />
            </a-radio-button>
          </a-radio-group>
          <a-button @click="handleExport" :disabled="dataSource.length === 0">
            <DownloadOutlined />
            导出
          </a-button>
        </a-space>
      </div>

      <!-- 表格视图 -->
      <a-table
        v-if="viewMode === 'table'"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'photo'">
            <a-avatar v-if="record.photo" :src="record.photo" :size="40" />
            <a-avatar v-else :size="40">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>
          <template v-if="column.key === 'gender'">
            {{ record.gender === 'male' ? '男' : '女' }}
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag.id" :color="tag.color">
              {{ tag.name }}
            </a-tag>
          </template>
          <template v-if="column.key === 'category'">
            {{ getCategoryName(record.categoryId) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="showDetailModal(record)">
              查看详情
            </a-button>
          </template>
        </template>
      </a-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <a-spin :spinning="loading">
          <a-row :gutter="[16, 16]">
            <a-col 
              v-for="item in dataSource" 
              :key="item.id" 
              :xs="24" 
              :sm="12" 
              :md="8" 
              :lg="6"
            >
              <a-card hoverable class="person-card" @click="showDetailModal(item)">
                <div class="card-content">
                  <a-avatar v-if="item.photo" :src="item.photo" :size="64" />
                  <a-avatar v-else :size="64" style="background-color: #1890ff">
                    {{ item.name?.charAt(0) }}
                  </a-avatar>
                  <div class="card-info">
                    <div class="card-name">{{ item.name }}</div>
                    <div class="card-meta">{{ item.gender === 'male' ? '男' : '女' }} | {{ item.ethnicity }}</div>
                    <div class="card-tags">
                      <a-tag v-for="tag in item.tags?.slice(0, 2)" :key="tag.id" :color="tag.color" size="small">
                        {{ tag.name }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
          
          <a-empty v-if="dataSource.length === 0 && !loading" description="暂无数据" />
          
          <div class="card-pagination" v-if="dataSource.length > 0">
            <a-pagination
              v-model:current="pagination.current"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              show-size-changer
              show-quick-jumper
              :show-total="(total: number) => `共 ${total} 条`"
              @change="handlePageChange"
            />
          </div>
        </a-spin>
      </div>
    </a-card>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:open="detailVisible"
      title="人员详情"
      :width="'60vw'"
    >
      <a-descriptions :column="2" bordered v-if="currentRecord">
        <a-descriptions-item label="姓名">{{ currentRecord.name }}</a-descriptions-item>
        <a-descriptions-item label="身份证号">{{ currentRecord.idCard }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{ currentRecord.gender === 'male' ? '男' : '女' }}</a-descriptions-item>
        <a-descriptions-item label="出生日期">{{ currentRecord.birthDate }}</a-descriptions-item>
        <a-descriptions-item label="民族">{{ currentRecord.ethnicity }}</a-descriptions-item>
        <a-descriptions-item label="籍贯">{{ currentRecord.nativePlace }}</a-descriptions-item>
        <a-descriptions-item label="政治面貌">{{ currentRecord.politicalStatus }}</a-descriptions-item>
        <a-descriptions-item label="学历">{{ currentRecord.education }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentRecord.phone }}</a-descriptions-item>
        <a-descriptions-item label="分类">{{ getCategoryName(currentRecord.categoryId) }}</a-descriptions-item>
        <a-descriptions-item label="标签" :span="2">
          <a-tag v-for="tag in currentRecord.tags" :key="tag.id" :color="tag.color">
            {{ tag.name }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="现住址" :span="2">{{ currentRecord.address }}</a-descriptions-item>
        <a-descriptions-item label="工作单位" :span="2">{{ currentRecord.workplace }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord.remark }}</a-descriptions-item>
      </a-descriptions>
    </DetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
  UserOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { personnelApi, tagApi, categoryApi } from '@/api'
import type { Personnel, Tag, Category } from '@/types'
import { exportToExcel } from '@/utils/excel'
import DetailDrawer from '@/components/DetailDrawer/index.vue'

// 数据状态
const loading = ref(false)
const dataSource = ref<Personnel[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const showAdvanced = ref(false)
const viewMode = ref<'table' | 'card'>('table')

// 民族列表
const ethnicities = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族',
  '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族'
]

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 搜索表单
const searchForm = reactive({
  name: '',
  idCard: '',
  phone: '',
  gender: undefined as string | undefined,
  categoryId: undefined as string | undefined,
  tagId: undefined as string | undefined,
  politicalStatus: undefined as string | undefined,
  education: undefined as string | undefined,
  ethnicity: undefined as string | undefined,
  nativePlace: '',
  workplace: '',
  address: ''
})

// 表格列
const columns = [
  { title: '照片', key: 'photo', width: 80, fixed: 'left' },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '性别', key: 'gender', width: 80 },
  { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 180 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '分类', key: 'category', width: 120 },
  { title: '标签', key: 'tags', width: 200 },
  { title: '现住址', dataIndex: 'address', key: 'address', ellipsis: true },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

// 弹窗状态
const detailVisible = ref(false)
const currentRecord = ref<Personnel | null>(null)

// 获取分类名称
const getCategoryName = (categoryId?: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.name || '-'
}

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await personnelApi.getList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    dataSource.value = res.data
    pagination.total = res.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
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
  } catch (error) {
    console.error('加载基础数据失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    idCard: '',
    phone: '',
    gender: undefined,
    categoryId: undefined,
    tagId: undefined,
    politicalStatus: undefined,
    education: undefined,
    ethnicity: undefined,
    nativePlace: '',
    workplace: '',
    address: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 分页变化
const handlePageChange = () => {
  loadData()
}

// 显示详情弹窗
const showDetailModal = (record: Personnel) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 导出
const handleExport = () => {
  if (dataSource.value.length === 0) {
    message.warning('暂无数据可导出')
    return
  }
  
  const exportData = dataSource.value.map(item => ({
    姓名: item.name,
    身份证号: item.idCard,
    性别: item.gender === 'male' ? '男' : '女',
    出生日期: item.birthDate,
    民族: item.ethnicity,
    籍贯: item.nativePlace,
    政治面貌: item.politicalStatus,
    学历: item.education,
    联系电话: item.phone,
    现住址: item.address,
    工作单位: item.workplace,
    分类: getCategoryName(item.categoryId),
    标签: item.tags?.map(t => t.name).join(',') || '',
    备注: item.remark
  }))
  
  exportToExcel(exportData, '人员检索结果')
}

onMounted(() => {
  loadBaseData()
  loadData()
})
</script>

<style scoped lang="less">
.search-page {
  .search-card {
    margin-bottom: 16px;
    
    .search-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px dashed #e8e8e8;
      margin-top: 16px;
    }
    
    .advanced-search {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed #e8e8e8;
    }
    
    .rotate-180 {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
  }
  
  .result-card {
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .result-info {
        font-size: 14px;
        color: #666;
        
        strong {
          color: #1890ff;
        }
      }
    }
  }
  
  .card-view {
    .person-card {
      .card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .card-info {
          flex: 1;
          overflow: hidden;
          
          .card-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .card-meta {
            font-size: 13px;
            color: #999;
            margin-bottom: 8px;
          }
          
          .card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }
    }
    
    .card-pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }
}
</style>
