<template>
  <div class="position-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="职务名称" class="w-full">
              <a-input v-model:value="searchForm.name" placeholder="请输入职务名称" allowClear />
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

    <!-- 表格区域 -->
    <a-card class="table-card">
      <div class="table-header">
        <div class="table-title">职务列表</div>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          添加职务
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">
              {{ getLevelLabel(record.level) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge 
              :status="record.status === 'active' ? 'success' : 'default'" 
              :text="record.status === 'active' ? '启用' : '禁用'" 
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除此职务吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="职务名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入职务名称" />
        </a-form-item>
        
        <a-form-item label="职务编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入职务编码" />
        </a-form-item>
        
        <a-form-item label="职务级别" name="level">
          <a-select v-model:value="formState.level" placeholder="请选择职务级别">
            <a-select-option value="senior">高级</a-select-option>
            <a-select-option value="middle">中级</a-select-option>
            <a-select-option value="junior">初级</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="排序" name="sort">
          <a-input-number 
            v-model:value="formState.sort" 
            :min="0" 
            placeholder="排序号" 
            style="width: 100%" 
          />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3" 
            placeholder="请输入职务描述" 
          />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { positionApi } from '@/api'
import type { Position } from '@/types'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const dataSource = ref<Position[]>([])

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
  name: ''
})

// 表格列
const columns = [
  { title: '职务名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '职务编码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '职务级别', key: 'level', width: 100 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150 }
]

// 弹窗状态
const modalVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<Position | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const formState = reactive<Partial<Position>>({
  name: '',
  code: '',
  level: undefined,
  sort: 0,
  description: '',
  status: 'active'
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入职务名称' }],
  code: [{ required: true, message: '请输入职务编码' }]
}

const modalTitle = computed(() => isEdit.value ? '编辑职务' : '添加职务')

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchForm.name) return dataSource.value
  return dataSource.value.filter(p => p.name.includes(searchForm.name))
})

// 获取级别颜色
const getLevelColor = (level?: string) => {
  const colors: Record<string, string> = {
    senior: 'gold',
    middle: 'blue',
    junior: 'green'
  }
  return colors[level || ''] || 'default'
}

// 获取级别标签
const getLevelLabel = (level?: string) => {
  const labels: Record<string, string> = {
    senior: '高级',
    middle: '中级',
    junior: '初级'
  }
  return labels[level || ''] || '-'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await positionApi.getList()
    dataSource.value = res.data
    pagination.total = res.data.length
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 前端搜索
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 显示新增弹窗
const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: Position) => {
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
    code: '',
    level: undefined,
    sort: 0,
    description: '',
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await positionApi.update(currentRecord.value!.id, formState as Position)
      message.success('更新成功')
    } else {
      await positionApi.create(formState as Position)
      message.success('添加成功')
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
    await positionApi.delete(id)
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
.position-management {
  .search-card {
    margin-bottom: 16px;
    
    :deep(.ant-form-item) {
      margin-bottom: 0;
      width: 100%;
    }
  }
  
  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .table-title {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.w-full {
  width: 100%;
}
</style>
