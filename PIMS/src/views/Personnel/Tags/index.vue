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
              <a-button type="link" size="small" @click="showTagPersonnel(record)">查看人员</a-button>
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
    
    <!-- 查看标签人员抽屉 -->
    <a-drawer
      v-model:open="personnelDrawerVisible"
      :title="`查看人员 (${currentTag?.name || ''})`"
      width="80%"
      :destroyOnClose="true"
    >
      <a-card>
        <div class="table-header">
          <div class="table-title">标签人员 ({{ personnelList.length }})</div>
        </div>
        
        <a-table
          :columns="personnelColumns"
          :data-source="personnelList"
          :loading="personnelLoading"
          :pagination="{ pageSize: 10 }"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'photo'">
              <a-avatar v-if="record.photo" :src="record.photo" :size="40" shape="square" />
              <a-avatar v-else :size="40" shape="square"><template #icon><UserOutlined /></template></a-avatar>
            </template>
            <template v-if="column.key === 'gender'">
              {{ record.gender === 'male' ? '男' : '女' }}
            </template>
            <template v-if="column.key === 'tags'">
              <a-tag v-for="tag in record.tags" :key="tag.id" :color="tag.color">
                {{ tag.name }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PlusOutlined, UserOutlined } from '@ant-design/icons-vue'
import { tagApi, personnelApi } from '@/api'
import type { Tag, Personnel } from '@/types'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

const columns = [
  { title: '标签名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '颜色预览', key: 'color', width: 150 },
  { title: '标签人数', dataIndex: 'personnelCount', key: 'personnelCount', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// Wrapper function to make tagApi compatible with useTable
const fetchTags = async (params: any) => {
  const [tagResult, personnelResult] = await Promise.all([
    tagApi.getList(),
    personnelApi.getList({ page: 1, pageSize: 1000 })
  ])
  
  // 统计每个标签的人数
  const tagsWithCount = tagResult.data.map((tag: Tag) => {
    const count = personnelResult.data.filter((person: Personnel) =>
      person.tags?.some(t => t.id === tag.id)
    ).length
    return { ...tag, personnelCount: count }
  })
  
  // Client-side pagination
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  return {
    data: tagsWithCount.slice(start, end),
    total: tagsWithCount.length
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

// 查看标签人员
const personnelDrawerVisible = ref(false)
const currentTag = ref<Tag | null>(null)
const personnelList = ref<Personnel[]>([])
const personnelLoading = ref(false)

const personnelColumns = [
  { title: '照片', key: 'photo', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '性别', key: 'gender', width: 80 },
  { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 180 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '标签', key: 'tags', width: 200 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 }
]

const showTagPersonnel = async (tag: Tag) => {
  currentTag.value = tag
  personnelDrawerVisible.value = true
  personnelLoading.value = true
  
  try {
    // 获取所有人员，然后筛选包含该标签的人员
    const res = await personnelApi.getList({ page: 1, pageSize: 1000 })
    personnelList.value = res.data.filter((person: Personnel) => 
      person.tags?.some(t => t.id === tag.id)
    )
  } catch (e) {
    console.error(e)
    personnelList.value = []
  } finally {
    personnelLoading.value = false
  }
}

</script>

<style scoped lang="less">
.tag-management {
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
</style>
