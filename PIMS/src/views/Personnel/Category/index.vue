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
              <a-button type="link" size="small" @click="showCategoryPersonnel(record)">查看人员</a-button>
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
    
    <!-- 查看分类人员抽屉 -->
    <a-drawer
      v-model:open="personnelDrawerVisible"
      :title="`查看人员 (${currentCategory?.name || ''})`"
      width="80%"
      :destroyOnClose="true"
    >
      <a-card>
        <div class="table-header">
          <div class="table-title">分类人员 ({{ personnelList.length }})</div>
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
import { categoryApi, personnelApi } from '@/api'
import type { Category, Personnel } from '@/types'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 120 },
  { title: '人员数量', dataIndex: 'personnelCount', key: 'personnelCount', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// Wrapper function to make categoryApi compatible with useTable
const fetchCategories = async (params: any) => {
  const [categoryResult, personnelResult] = await Promise.all([
    categoryApi.getList(),
    personnelApi.getList({ page: 1, pageSize: 1000 })
  ])
  
  // 统计每个分类的人数
  const categoriesWithCount = categoryResult.data.map((category: Category) => {
    const count = personnelResult.data.filter((person: Personnel) =>
      person.categoryId === category.id
    ).length
    return { ...category, personnelCount: count }
  })
  
  // Client-side pagination
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  return {
    data: categoriesWithCount.slice(start, end),
    total: categoriesWithCount.length
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

// 查看分类人员
const personnelDrawerVisible = ref(false)
const currentCategory = ref<Category | null>(null)
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

const showCategoryPersonnel = async (category: Category) => {
  currentCategory.value = category
  personnelDrawerVisible.value = true
  personnelLoading.value = true
  
  try {
    // 获取所有人员，然后筛选该分类的人员
    const res = await personnelApi.getList({ page: 1, pageSize: 1000 })
    personnelList.value = res.data.filter((person: Personnel) => 
      person.categoryId === category.id
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
.category-management {
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
</style>
