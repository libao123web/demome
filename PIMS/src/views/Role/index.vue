<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="角色名称" class="w-full">
              <a-input v-model:value="searchForm.name" placeholder="请输入角色名称" allowClear />
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
        <div class="table-title">角色列表</div>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          添加角色
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
          <template v-if="column.key === 'permissions'">
            <div class="permission-tags">
              <a-tag v-for="perm in record.permissions?.slice(0, 3)" :key="perm" color="blue">
                {{ getPermissionLabel(perm) }}
              </a-tag>
              <a-tag v-if="record.permissions?.length > 3">
                +{{ record.permissions.length - 3 }}
              </a-tag>
            </div>
          </template>
          <template v-if="column.key === 'status'">
            <a-badge 
              :status="record.status === 'active' ? 'success' : 'default'" 
              :text="record.status === 'active' ? '启用' : '禁用'" 
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showDetailModal(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="showEditModal(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除此角色吗？"
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
      width="600px"
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
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入角色名称" />
        </a-form-item>
        
        <a-form-item label="角色编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入角色编码" />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="2" 
            placeholder="请输入角色描述" 
          />
        </a-form-item>
        
        <a-form-item label="权限配置" name="permissions">
          <div class="permission-config">
            <a-checkbox-group v-model:value="formState.permissions">
              <a-row :gutter="[0, 8]">
                <a-col :span="24" v-for="group in permissionGroups" :key="group.name">
                  <div class="permission-group">
                    <div class="group-title">{{ group.name }}</div>
                    <div class="group-items">
                      <a-checkbox 
                        v-for="perm in group.permissions" 
                        :key="perm.value" 
                        :value="perm.value"
                      >
                        {{ perm.label }}
                      </a-checkbox>
                    </div>
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
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="角色详情"
      width="600px"
      :footer="null"
    >
      <a-descriptions :column="1" bordered v-if="currentRecord">
        <a-descriptions-item label="角色名称">{{ currentRecord.name }}</a-descriptions-item>
        <a-descriptions-item label="角色编码">{{ currentRecord.code || '-' }}</a-descriptions-item>
        <a-descriptions-item label="描述">{{ currentRecord.description || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge 
            :status="currentRecord.status === 'active' ? 'success' : 'default'" 
            :text="currentRecord.status === 'active' ? '启用' : '禁用'" 
          />
        </a-descriptions-item>
        <a-descriptions-item label="权限">
          <div class="permission-list">
            <a-tag v-for="perm in currentRecord.permissions" :key="perm" color="blue">
              {{ getPermissionLabel(perm) }}
            </a-tag>
          </div>
        </a-descriptions-item>
      </a-descriptions>
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
import { roleApi } from '@/api'
import type { Role } from '@/types'

// 权限分组
const permissionGroups = [
  {
    name: '人员管理',
    permissions: [
      { label: '人员列表', value: 'personnel:list' },
      { label: '人员新增', value: 'personnel:create' },
      { label: '人员编辑', value: 'personnel:edit' },
      { label: '人员删除', value: 'personnel:delete' },
      { label: '人员导入', value: 'personnel:import' },
      { label: '人员导出', value: 'personnel:export' }
    ]
  },
  {
    name: '标签管理',
    permissions: [
      { label: '标签列表', value: 'tag:list' },
      { label: '标签新增', value: 'tag:create' },
      { label: '标签编辑', value: 'tag:edit' },
      { label: '标签删除', value: 'tag:delete' }
    ]
  },
  {
    name: '分类管理',
    permissions: [
      { label: '分类列表', value: 'category:list' },
      { label: '分类新增', value: 'category:create' },
      { label: '分类编辑', value: 'category:edit' },
      { label: '分类删除', value: 'category:delete' }
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

// 获取权限标签
const getPermissionLabel = (value: string): string => {
  for (const group of permissionGroups) {
    const perm = group.permissions.find(p => p.value === value)
    if (perm) return perm.label
  }
  return value
}

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const dataSource = ref<Role[]>([])

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
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '角色编码', dataIndex: 'code', key: 'code', width: 120 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '权限', key: 'permissions', width: 300 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180 }
]

// 弹窗状态
const modalVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<Role | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const formState = reactive<Partial<Role>>({
  name: '',
  code: '',
  description: '',
  permissions: [],
  status: 'active'
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [{ required: true, message: '请输入角色编码' }]
}

const modalTitle = computed(() => isEdit.value ? '编辑角色' : '添加角色')

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchForm.name) return dataSource.value
  return dataSource.value.filter(r => r.name.includes(searchForm.name))
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await roleApi.getList()
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
const showEditModal = (record: Role) => {
  isEdit.value = true
  Object.assign(formState, record)
  currentRecord.value = record
  modalVisible.value = true
}

// 显示详情弹窗
const showDetailModal = (record: Role) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    name: '',
    code: '',
    description: '',
    permissions: [],
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
      await roleApi.update(currentRecord.value!.id, formState as Role)
      message.success('更新成功')
    } else {
      await roleApi.create(formState as Role)
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
    await roleApi.delete(id)
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
.role-management {
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
  
  .permission-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.permission-config {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  
  .permission-group {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .group-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: #333;
    }
    
    .group-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-left: 16px;
    }
  }
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.w-full {
  width: 100%;
}
</style>
