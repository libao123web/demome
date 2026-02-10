<template>
  <div class="category-management">
    <a-card>
      <div class="table-header">
        <div class="table-title">分类管理</div>
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 新增分类
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
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此分类吗？" @confirm="handleDelete(record.id)">
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
      :title="isEdit ? '编辑分类' : '新增分类'"
      @ok="handleSubmit"
      @cancel="close"
      :confirmLoading="submitLoading"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入分类名称" />
        </a-form-item>
        
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formState.sort" :min="0" placeholder="请输入排序" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { categoryApi } from '@/api'
import type { Category } from '@/types'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 120 },
  { title: '人员数量', dataIndex: 'count', key: 'count', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// Wrapper function to make categoryApi compatible with useTable
const fetchCategories = async (params: any) => {
  const result = await categoryApi.getList()
  // Client-side pagination
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  return {
    data: result.data.slice(start, end),
    total: result.data.length
  }
}

const { loading, dataSource, pagination, loadData, handleTableChange } = useTable({
  fetchApi: fetchCategories,
  defaultPageSize: 10
})

onMounted(() => loadData())

const handleDelete = async (id: string) => {
  try {
    await categoryApi.delete(id)
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const formRules = {
  name: [{ required: true, message: '请输入分类名称' }],
  sort: [{ required: true, message: '请输入排序' }]
}

const defaultFormState = { name: '', sort: 0 }

const { visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit } = useForm<Partial<Category>>({
  defaultValues: defaultFormState,
  createApi: categoryApi.create,
  updateApi: categoryApi.update,
  onSuccess: () => loadData()
})
</script>

<style scoped lang="less">
.category-management {
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
</style>
