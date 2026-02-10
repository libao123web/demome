<template>
  <div class="position-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchParams" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="职务名称" class="w-full">
              <a-input v-model:value="searchParams.name" placeholder="请输入职务名称" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-space>
              <a-button type="primary" html-type="submit" :loading="loading">
                <SearchOutlined /> 搜索
              </a-button>
              <a-button @click="resetSearch">
                <ReloadOutlined /> 重置
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
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 添加职务
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">{{ getLevelLabel(record.level) }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 'active' ? 'success' : 'error'" :text="record.status === 'active' ? '启用' : '禁用'" />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此职务吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑抽屉 -->
    <FormDrawer
      v-model:open="visible"
      :title="isEdit ? '编辑职务' : '添加职务'"
      :loading="submitLoading"
      @confirm="handleSubmit"
      @cancel="close"
      :width="'60vw'"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
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
          <a-input-number v-model:value="formState.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入职务描述" />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </FormDrawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { positionApi } from '@/api'
import type { Position } from '@/types'
import FormDrawer from '@/components/FormDrawer/index.vue'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

// 表格列
const columns = [
  { title: '职务名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '职务编码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '职务级别', key: 'level', width: 100 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const getLevelColor = (level?: string) => {
  const map: Record<string, string> = { senior: 'red', middle: 'orange', junior: 'blue' }
  return map[level || ''] || 'default'
}

const getLevelLabel = (level?: string) => {
  const map: Record<string, string> = { senior: '高级', middle: '中级', junior: '初级' }
  return map[level || ''] || '-'
}

// 表格逻辑
const { 
  loading, dataSource, pagination, searchParams, loadData, handleTableChange, handleSearch, resetSearch 
} = useTable({
  fetchApi: async (params: any) => {
    const result = await positionApi.getList()
    // Client-side filtering and pagination
    let filtered = result.data
    if (params.name) {
      filtered = filtered.filter((p: Position) => p.name.includes(params.name))
    }
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    return {
      data: filtered.slice(start, end),
      total: filtered.length
    }
  },
  defaultSearchParams: { name: '' },
  defaultPageSize: 10
})

onMounted(() => loadData())

const handleDelete = async (id: string) => {
  try {
    await positionApi.delete(id)
    loadData()
  } catch (e) {
    console.error(e)
  }
}

// 表单逻辑
const formRules = {
  name: [{ required: true, message: '请输入职务名称' }],
  code: [{ required: true, message: '请输入职务编码' }],
  level: [{ required: true, message: '请选择职务级别' }]
}

const defaultFormState = {
  name: '', code: '', level: undefined as 'senior' | 'middle' | 'junior' | undefined, 
  sort: 0, description: '', status: 'active' as 'active' | 'inactive'
}

const { 
  visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit 
} = useForm<Partial<Position>>({
  defaultValues: defaultFormState,
  createApi: positionApi.create,
  updateApi: positionApi.update,
  onSuccess: () => loadData()
})
</script>

<style scoped lang="less">
.position-management {
  .search-card { margin-bottom: 16px; :deep(.ant-form-item) { margin-bottom: 0; width: 100%; } }
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
.w-full { width: 100%; }
</style>
