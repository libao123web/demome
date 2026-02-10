<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchParams" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="角色名称" class="w-full">
              <a-input v-model:value="searchParams.name" placeholder="请输入角色名称" allowClear />
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
        <div class="table-title">角色列表</div>
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 添加角色
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
          <template v-if="column.key === 'permissions'">
            <a-tag v-for="perm in record.permissions?.slice(0, 3)" :key="perm" color="blue">
              {{ getPermissionLabel(perm) }}
            </a-tag>
            <a-tag v-if="record.permissions && record.permissions.length > 3">
              +{{ record.permissions.length - 3 }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 'active' ? 'success' : 'error'" :text="record.status === 'active' ? '启用' : '禁用'" />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此角色吗？" @confirm="handleDelete(record.id)">
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
      :title="isEdit ? '编辑角色' : '添加角色'"
      :loading="submitLoading"
      @confirm="handleSubmit"
      @cancel="close"
      :width="'60vw'"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入角色名称" />
        </a-form-item>
        
        <a-form-item label="角色编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入角色编码" />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="2" placeholder="请输入角色描述" />
        </a-form-item>
        
        <a-form-item label="权限配置" name="permissions">
          <div class="permission-config">
            <a-checkbox-group v-model:value="formState.permissions">
              <a-row :gutter="[0, 8]">
                <a-col :span="24" v-for="group in permissionGroups" :key="group.name">
                  <div class="permission-group">
                    <div class="group-title">{{ group.name }}</div>
                    <a-row :gutter="[8, 8]">
                      <a-col :span="8" v-for="perm in group.permissions" :key="perm.value">
                        <a-checkbox :value="perm.value">{{ perm.label }}</a-checkbox>
                      </a-col>
                    </a-row>
                  </div>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </div>
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
import { roleApi } from '@/api'
import type { Role } from '@/types'
import FormDrawer from '@/components/FormDrawer/index.vue'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

// 权限分组
const permissionGroups = [
  {
    name: '人员管理',
    permissions: [
      { label: '人员列表', value: 'personnel:list' },
      { label: '人员新增', value: 'personnel:create' },
      { label: '人员编辑', value: 'personnel:edit' },
      { label: '人员删除', value: 'personnel:delete' }
    ]
  },
  {
    name: '搜索查询',
    permissions: [
      { label: '人员检索', value: 'search:view' }
    ]
  },
  {
    name: '系统管理',
    permissions: [
      { label: '用户管理', value: 'user:manage' },
      { label: '角色管理', value: 'role:manage' },
      { label: '职务管理', value: 'position:manage' }
    ]
  }
]

const getPermissionLabel = (value: string): string => {
  for (const group of permissionGroups) {
    const perm = group.permissions.find(p => p.value === value)
    if (perm) return perm.label
  }
  return value
}

// 表格列
const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '角色编码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '权限', key: 'permissions', width: 300 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 表格逻辑
const { 
  loading, dataSource, pagination, searchParams, loadData, handleTableChange, handleSearch, resetSearch 
} = useTable({
  fetchApi: async (params: any) => {
    const result = await roleApi.getList()
    // Client-side filtering and pagination
    let filtered = result.data
    if (params.name) {
      filtered = filtered.filter((r: Role) => r.name.includes(params.name))
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
    await roleApi.delete(id)
    loadData()
  } catch (e) {
    console.error(e)
  }
}

// 表单逻辑
const formRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [{ required: true, message: '请输入角色编码' }],
  permissions: [{ required: true, type: 'array', min: 1, message: '请至少选择一个权限' }]
}

const defaultFormState = {
  name: '', code: '', description: '', permissions: [], status: 'active' as 'active' | 'inactive'
}

const { 
  visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit 
} = useForm<Partial<Role>>({
  defaultValues: defaultFormState,
  createApi: roleApi.create,
  updateApi: roleApi.update,
  onSuccess: () => loadData()
})
</script>

<style scoped lang="less">
.role-management {
  .search-card { margin-bottom: 16px; :deep(.ant-form-item) { margin-bottom: 0; width: 100%; } }
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
.permission-config {
  .permission-group {
    margin-bottom: 16px;
    .group-title { font-weight: 500; margin-bottom: 8px; color: rgba(0,0,0,0.85); }
  }
}
.w-full { width: 100%; }
</style>
