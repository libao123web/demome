<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="用户名" class="w-full">
              <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="姓名" class="w-full">
              <a-input v-model:value="searchForm.name" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="状态" class="w-full">
              <a-select v-model:value="searchForm.status" placeholder="请选择状态" allowClear>
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="inactive">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
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
        <div class="table-title">用户列表</div>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          添加用户
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
              :text="record.status === 'active' ? '启用' : '禁用'" 
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showEditModal(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleResetPassword(record)">
                重置密码
              </a-button>
              <a-popconfirm
                :title="record.status === 'active' ? '确定要禁用此用户吗？' : '确定要启用此用户吗？'"
                @confirm="handleToggleStatus(record)"
              >
                <a-button type="link" size="small" :danger="record.status === 'active'">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要删除此用户吗？"
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
        <a-form-item label="用户名" name="username">
          <a-input 
            v-model:value="formState.username" 
            placeholder="请输入用户名" 
            :disabled="isEdit"
          />
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
          <a-select 
            v-model:value="formState.roleIds" 
            mode="multiple" 
            placeholder="请选择角色"
          >
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

    <!-- 重置密码弹窗 -->
    <a-modal
      v-model:open="resetPwdVisible"
      title="重置密码"
      @ok="confirmResetPassword"
      @cancel="resetPwdVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="新密码">
          <a-input-password v-model:value="newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认密码">
          <a-input-password v-model:value="confirmPassword" placeholder="请再次输入新密码" />
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
import { userApi, roleApi } from '@/api'
import type { User, Role } from '@/types'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const dataSource = ref<User[]>([])
const roles = ref<Role[]>([])

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
  username: '',
  name: '',
  status: undefined as string | undefined
})

// 表格列
const columns = [
  { title: '头像', key: 'avatar', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '角色', key: 'roles', width: 150 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

// 弹窗状态
const modalVisible = ref(false)
const resetPwdVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<User | null>(null)
const formRef = ref<FormInstance>()
const newPassword = ref('')
const confirmPassword = ref('')

// 表单数据
const formState = reactive<Partial<User> & { password?: string; roleIds?: string[] }>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 'active'
})

// 表单验证规则
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

const modalTitle = computed(() => isEdit.value ? '编辑用户' : '添加用户')

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await userApi.getList({
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

// 加载角色
const loadRoles = async () => {
  try {
    const res = await roleApi.getList()
    roles.value = res.data
  } catch (error) {
    console.error('加载角色失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.name = ''
  searchForm.status = undefined
  handleSearch()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 显示新增弹窗
const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: User) => {
  isEdit.value = true
  Object.assign(formState, {
    ...record,
    roleIds: record.roles?.map(r => r.id) || []
  })
  currentRecord.value = record
  modalVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    roleIds: [],
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    const submitData = {
      ...formState,
      roles: formState.roleIds?.map(id => roles.value.find(r => r.id === id)).filter(Boolean)
    }
    delete (submitData as any).roleIds
    delete (submitData as any).password
    
    if (isEdit.value) {
      await userApi.update(currentRecord.value!.id, submitData as User)
      message.success('更新成功')
    } else {
      await userApi.create({ ...submitData, password: formState.password } as User)
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

// 切换状态
const handleToggleStatus = async (record: User) => {
  try {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    await userApi.update(record.id, { ...record, status: newStatus })
    message.success('操作成功')
    loadData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await userApi.delete(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

// 重置密码
const handleResetPassword = (record: User) => {
  currentRecord.value = record
  newPassword.value = ''
  confirmPassword.value = ''
  resetPwdVisible.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  if (!newPassword.value) {
    message.warning('请输入新密码')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    message.warning('两次输入的密码不一致')
    return
  }
  if (newPassword.value.length < 6) {
    message.warning('密码至少6个字符')
    return
  }
  
  try {
    // 模拟重置密码
    message.success('密码重置成功')
    resetPwdVisible.value = false
  } catch (error) {
    message.error('重置失败')
  }
}

onMounted(() => {
  loadRoles()
  loadData()
})
</script>

<style scoped lang="less">
.user-management {
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
