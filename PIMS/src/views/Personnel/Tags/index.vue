<template>
  <div class="personnel-tags">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="标签名称" class="w-full">
              <a-input v-model:value="searchForm.name" placeholder="请输入标签名称" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-space>
              <a-button type="primary" html-type="submit">
                <SearchOutlined />
                搜索
              </a-button>
              <a-button @click="resetSearch">
                <ReloadOutlined />
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 标签列表 -->
    <a-card class="tag-card">
      <div class="card-header">
        <div class="card-title">标签管理</div>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          新增标签
        </a-button>
      </div>

      <!-- 标签展示 -->
      <a-spin :spinning="loading">
        <div class="tag-grid">
          <a-card 
            v-for="tag in filteredTags" 
            :key="tag.id" 
            class="tag-item"
            :bodyStyle="{ padding: '16px' }"
          >
            <div class="tag-content">
              <div class="tag-info">
                <a-tag :color="tag.color" class="tag-badge">{{ tag.name }}</a-tag>
                <div class="tag-count">
                  <UserOutlined />
                  <span>{{ tag.count || 0 }} 人</span>
                </div>
              </div>
              <div class="tag-desc" v-if="tag.description">{{ tag.description }}</div>
              <div class="tag-actions">
                <a-button type="text" size="small" @click="showEditModal(tag)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-popconfirm
                  title="确定要删除此标签吗？"
                  @confirm="handleDelete(tag.id)"
                >
                  <a-button type="text" size="small" danger>
                    <DeleteOutlined />
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-card>

          <a-empty v-if="filteredTags.length === 0" description="暂无标签" />
        </div>
      </a-spin>
    </a-card>

    <!-- 新增/编辑抽屉 -->
    <FormDrawer
      v-model:open="modalVisible"
      :title="modalTitle"
      :loading="submitLoading"
      @confirm="handleSubmit"
      @cancel="handleCancel"
      :width="'60vw'"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="标签名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入标签名称" />
        </a-form-item>
        
        <a-form-item label="标签颜色" name="color">
          <div class="color-picker">
            <div 
              v-for="color in colorOptions" 
              :key="color"
              class="color-option"
              :class="{ active: formState.color === color }"
              :style="{ backgroundColor: color }"
              @click="formState.color = color"
            />
          </div>
          <a-tag :color="formState.color" class="color-preview">
            {{ formState.name || '预览' }}
          </a-tag>
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3" 
            placeholder="请输入标签描述" 
          />
        </a-form-item>
      </a-form>
    </FormDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { tagApi } from '@/api'
import type { Tag } from '@/types'
import FormDrawer from '@/components/FormDrawer/index.vue'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const tags = ref<Tag[]>([])

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 颜色选项
const colorOptions = [
  '#f50', '#2db7f5', '#87d068', '#108ee9', '#722ed1',
  '#eb2f96', '#faad14', '#13c2c2', '#52c41a', '#1890ff'
]

// 弹窗状态
const modalVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<Tag | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const formState = reactive<Partial<Tag>>({
  name: '',
  color: '#1890ff',
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入标签名称' }],
  color: [{ required: true, message: '请选择标签颜色' }]
}

const modalTitle = computed(() => isEdit.value ? '编辑标签' : '新增标签')

// 过滤后的标签
const filteredTags = computed(() => {
  if (!searchForm.name) return tags.value
  return tags.value.filter(t => t.name.includes(searchForm.name))
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await tagApi.getList()
    tags.value = res.data
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 前端搜索，无需请求
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
}

// 显示新增弹窗
const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: Tag) => {
  isEdit.value = true
  Object.assign(formState, record)
  currentRecord.value = record
  modalVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    name: '',
    color: '#1890ff',
    description: ''
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await tagApi.update(currentRecord.value!.id, formState as Tag)
      message.success('更新成功')
    } else {
      await tagApi.create(formState as Tag)
      message.success('新增成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error: any) {
    if (error.errorFields) {
      return
    }
    message.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await tagApi.delete(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.personnel-tags {
  .search-card {
    margin-bottom: 16px;
    
    :deep(.ant-form-item) {
      margin-bottom: 0;
      width: 100%;
    }
  }
  
  .tag-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .card-title {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
  
  .tag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    
    @media (max-width: 576px) {
      grid-template-columns: 1fr;
    }
  }
  
  .tag-item {
    .tag-content {
      .tag-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .tag-badge {
          font-size: 14px;
          padding: 4px 12px;
        }
        
        .tag-count {
          color: #999;
          font-size: 13px;
          
          span {
            margin-left: 4px;
          }
        }
      }
      
      .tag-desc {
        color: #666;
        font-size: 13px;
        margin-bottom: 12px;
        line-height: 1.5;
      }
      
      .tag-actions {
        display: flex;
        gap: 8px;
        border-top: 1px solid #f0f0f0;
        padding-top: 12px;
        margin-top: 8px;
      }
    }
  }
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  
  .color-option {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &.active {
      border-color: #333;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
  }
}

.color-preview {
  font-size: 14px;
  padding: 4px 12px;
}

.w-full {
  width: 100%;
}
</style>
