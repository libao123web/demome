<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchParams" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="用户名" class="w-full">
              <a-input v-model:value="searchParams.username" placeholder="请输入用户名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="姓名" class="w-full">
              <a-input v-model:value="searchParams.name" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="状态" class="w-full">
              <a-select v-model:value="searchParams.status" placeholder="请选择状态" allowClear>
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="inactive">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
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
        <div class="table-title">用户列表</div>
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 添加用户
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1000 }"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar v-if="record.avatar" :src="record.avatar" :size="36" />
            <a-avatar v-else :size="36" style="background-color: #1890ff">
              {{ record.name?.charAt(0) || record.username?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-if="column.key === 'roles'">
            <a-tag v-for="role in record.roles" :key="role.id" color="blue">
              {{ role.name }}
            </a-tag>
            <span v-if="!record.roles?.length">-</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge 
              :status="record.status === 'active' ? 'success' : 'error'" 
              :text="record.status === 'active' ? '正常' : '禁用'" 
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEditWithRoles(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此用户吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="visible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      @ok="handleSubmit"
      @cancel="close"
      :confirmLoading="submitLoading"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" :disabled="isEdit" />
        </a-form-item>
        
        <a-form-item v-if="!isEdit" label="密码" name="password">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
        </a-form-item>
        
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>
        
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
        </a-form-item>
        
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
        </a-form-item>
        
        <a-form-item label="角色" name="roleIds">
          <a-select v-model:value="formState.roleIds" mode="multiple" placeholder="请选择角色">
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
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
import { ref, onMounted, computed } from 'vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { userApi, roleApi } from '@/api'
import type { User, Role } from '@/types'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

// 基础数据
const roles = ref<Role[]>([])

onMounted(async () => {
  try {
    const res = await roleApi.getList()
    roles.value = res.data
  } catch (e) {
    console.error(e)
  }
})

// 表格列
const columns = [
  { title: '头像', key: 'avatar', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '角色', key: 'roles', width: 150 },
  { title: '账号状态', key: 'status', width: 100 },
  { title: '最近登录', dataIndex: 'lastLoginTime', key: 'lastLoginTime', width: 160 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 表格逻辑
const { 
  loading, dataSource, pagination, searchParams, loadData, handleTableChange, handleSearch, resetSearch 
} = useTable({
  fetchApi: userApi.getList,
  defaultSearchParams: { username: '', name: '', status: undefined }
})

onMounted(() => loadData())

const handleDelete = async (id: string) => {
  try {
    await userApi.delete(id)
    loadData()
  } catch (e) {
    console.error(e)
  }
}

// 表单逻辑
const formRules = computed(() => ({
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' }
  ],
  password: isEdit.value ? [] : [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' }
  ],
  name: [{ required: true, message: '请输入姓名' }],
  email: [{ type: 'email', message: '邮箱格式不正确' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]
}))

const defaultFormState = {
  username: '', password: '', name: '', email: '', phone: '', roleIds: [], status: 'active' as 'active' | 'inactive'
}

const { 
  visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit 
} = useForm<Partial<User> & { password?: string; roleIds: string[] }>({
  defaultValues: defaultFormState,
  createApi: async (data) => {
    const submitData = {
      ...data,
      roles: data.roleIds?.map(id => roles.value.find(r => r.id === id)).filter(Boolean)
    }
    delete (submitData as any).roleIds
    await userApi.create(submitData as User)
  },
  updateApi: async (id, data) => {
    const submitData = {
      ...data,
      roles: data.roleIds?.map(id => roles.value.find(r => r.id === id)).filter(Boolean)
    }
    delete (submitData as any).roleIds
    delete (submitData as any).password
    await userApi.update(id, submitData as User)
  },
  onSuccess: () => loadData()
})

const openEditWithRoles = (record: User) => {
  openEdit({
    ...record,
    roleIds: record.roles?.map(r => r.id) || []
  })
}
</script>

<style scoped lang="less">
.user-management {
  .search-card { margin-bottom: 16px; :deep(.ant-form-item) { margin-bottom: 0; width: 100%; } }
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
.w-full { width: 100%; }
</style>
