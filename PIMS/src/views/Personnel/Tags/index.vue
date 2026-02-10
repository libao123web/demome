<template>
  <div class="tag-management">
    <a-card>
      <div class="table-header">
        <div class="table-title">标签管理</div>
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 新增标签
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
          <template v-if="column.key === 'color'">
            <a-tag :color="record.color">{{ record.name }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此标签吗？" @confirm="handleDelete(record.id)">
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
      :title="isEdit ? '编辑标签' : '新增标签'"
      @ok="handleSubmit"
      @cancel="close"
      :confirmLoading="submitLoading"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="标签名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入标签名称" />
        </a-form-item>
        
        <a-form-item label="标签颜色" name="color">
          <a-select v-model:value="formState.color" placeholder="请选择颜色">
            <a-select-option value="#f50">#f50 红色</a-select-option>
            <a-select-option value="#2db7f5">#2db7f5 蓝色</a-select-option>
            <a-select-option value="#87d068">#87d068 绿色</a-select-option>
            <a-select-option value="#108ee9">#108ee9 深蓝</a-select-option>
            <a-select-option value="#f5222d">#f5222d 深红</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { tagApi } from '@/api'
import type { Tag } from '@/types'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

const columns = [
  { title: '标签名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '颜色预览', key: 'color', width: 150 },
  { title: '使用次数', dataIndex: 'count', key: 'count', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// Wrapper function to make tagApi compatible with useTable
const fetchTags = async (params: any) => {
  const result = await tagApi.getList()
  // Client-side pagination
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  return {
    data: result.data.slice(start, end),
    total: result.data.length
  }
}

const { loading, dataSource, pagination, loadData, handleTableChange } = useTable({
  fetchApi: fetchTags,
  defaultPageSize: 10
})

onMounted(() => loadData())

const handleDelete = async (id: string) => {
  try {
    await tagApi.delete(id)
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const formRules = {
  name: [{ required: true, message: '请输入标签名称' }],
  color: [{ required: true, message: '请选择标签颜色' }]
}

const defaultFormState = { name: '', color: '#2db7f5' }

const { visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit } = useForm<Partial<Tag>>({
  defaultValues: defaultFormState,
  createApi: tagApi.create,
  updateApi: tagApi.update,
  onSuccess: () => loadData()
})
</script>

<style scoped lang="less">
.tag-management {
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
</style>
