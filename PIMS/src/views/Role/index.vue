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
          <a-alert 
            v-if="isAdminRole" 
            message="管理员角色拥有所有权限,不可修改" 
            type="info" 
            show-icon 
            class="mb-3"
          />
          <div class="permission-tree-container">
            <div class="tree-actions">
              <a-space>
                <a-button size="small" @click="handleCheckAll" :disabled="isAdminRole">全选</a-button>
                <a-button size="small" @click="handleUncheckAll" :disabled="isAdminRole">取消全选</a-button>
                <a-button size="small" @click="handleExpandAll">展开全部</a-button>
                <a-button size="small" @click="handleCollapseAll">收起全部</a-button>
              </a-space>
            </div>
            <a-tree
              v-model:checkedKeys="formState.permissions"
              v-model:expandedKeys="expandedKeys"
              checkable
              :disabled="isAdminRole"
              :tree-data="permissionTreeData"
              :field-names="{ title: 'title', key: 'key', children: 'children' }"
              :checkStrictly="false"
            />
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
import { ref, onMounted, computed, watch } from 'vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { roleApi } from '@/api'
import type { Role } from '@/types'
import FormDrawer from '@/components/FormDrawer/index.vue'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'
import { permissionTree, getPermissionLabel, getAllPermissionKeys } from '@/constants/permissions'

// 权限树数据
const permissionTreeData = permissionTree
const expandedKeys = ref<string[]>([])

// 判断是否为管理员角色
const isAdminRole = computed(() => {
  return formState.code === 'admin' || formState.name === '管理员'
})

// 权限树操作
const handleCheckAll = () => {
  if (formState.value) {
    formState.value.permissions = getAllPermissionKeys()
  }
}

const handleUncheckAll = () => {
  if (formState.value) {
    formState.value.permissions = []
  }
}

const handleExpandAll = () => {
  // 获取所有有子节点的节点key
  const keys: string[] = []
  const traverse = (nodes: typeof permissionTree) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key)
        traverse(node.children)
      }
    })
  }
  traverse(permissionTree)
  expandedKeys.value = keys
}

const handleCollapseAll = () => {
  expandedKeys.value = []
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
  name: '', code: '', description: '', permissions: [] as string[], status: 'active' as 'active' | 'inactive'
}

const { 
  visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit: originalOpenEdit, close, handleSubmit 
} = useForm<Partial<Role>>({
  defaultValues: defaultFormState,
  createApi: roleApi.create,
  updateApi: roleApi.update,
  onSuccess: () => loadData()
})

// 包装 openEdit，管理员角色自动选中所有权限
const openEdit = (record: Role) => {
  originalOpenEdit(record)
  // 延迟执行以确保 formState 已更新
  setTimeout(() => {
    if (isAdminRole.value) {
      formState.permissions = getAllPermissionKeys()
    }
  }, 0)
}

// 监听角色编码和名称变化，管理员角色自动选中所有权限
watch(
  () => [formState.code, formState.name],
  () => {
    if (isAdminRole.value) {
      formState.permissions = getAllPermissionKeys()
    }
  }
)
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
  .table-header { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 16px; 
    .table-title { 
      font-size: 16px; 
      font-weight: 500; 
    } 
  }
}

.permission-tree-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  
  .tree-actions {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  :deep(.ant-tree) {
    max-height: 400px;
    overflow-y: auto;
    
    .ant-tree-checkbox {
      margin-right: 8px;
    }
    
    .ant-tree-node-content-wrapper {
      &:hover {
        background-color: #f5f5f5;
      }
    }
    
    // 第三级节点横向排列
    .ant-tree-treenode {
      // 找到第二级节点下的子节点容器
      .ant-tree-child-tree {
        .ant-tree-child-tree {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-left: 24px !important;
          
          .ant-tree-treenode {
            flex: 0 0 auto;
            width: auto;
            
            .ant-tree-indent {
              display: none;
            }
            
            .ant-tree-switcher {
              display: none;
            }
          }
        }
      }
    }
  }
}

.w-full { 
  width: 100%; 
}
</style>
