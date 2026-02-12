<template>
  <div class="position-tag-management">
    <a-card>
      <div class="table-header">
        <div class="table-title">岗位标签管理</div>
        <a-button type="primary" @click="openCreate">
          <PlusOutlined /> 新增岗位标签
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
          <template v-if="column.key === 'name'">
            <a-tag color="blue">{{ record.name }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此岗位标签吗？" @confirm="handleDelete(record.id)">
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
      :title="isEdit ? '编辑岗位标签' : '新增岗位标签'"
      @ok="handleSubmit"
      @cancel="close"
      :confirmLoading="submitLoading"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="岗位标签名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入岗位标签名称" />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" placeholder="请输入描述信息" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { positionTagApi } from '@/api'
import type { PositionTag } from '@/types'

// 表格数据
const dataSource = ref<PositionTag[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 表格列
const columns = [
  { title: '岗位标签名称', key: 'name', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 表单相关
const visible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const formState = reactive<Partial<PositionTag>>({
  id: '',
  name: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入岗位标签名称', trigger: 'blur' }]
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await positionTagApi.getList({
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    dataSource.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

// 打开新增弹窗
const openCreate = () => {
  isEdit.value = false
  visible.value = true
  Object.assign(formState, {
    id: '',
    name: '',
    description: ''
  })
  formRef.value?.clearValidate()
}

// 打开编辑弹窗
const openEdit = (record: PositionTag) => {
  isEdit.value = true
  visible.value = true
  Object.assign(formState, {
    id: record.id,
    name: record.name,
    description: record.description
  })
  formRef.value?.clearValidate()
}

// 关闭弹窗
const close = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await positionTagApi.update(formState.id!, formState)
      message.success('更新成功')
    } else {
      await positionTagApi.create(formState)
      message.success('创建成功')
    }
    
    close()
    fetchData()
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      message.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await positionTagApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.position-tag-management {
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
</style>
