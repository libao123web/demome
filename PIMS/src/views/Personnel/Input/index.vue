<template>
  <div class="personnel-input">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchParams" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="姓名" class="w-full">
              <a-input v-model:value="searchParams.name" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="身份证号" class="w-full">
              <a-input v-model:value="searchParams.idCard" placeholder="请输入身份证号" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="分类" class="w-full">
              <a-select v-model:value="searchParams.categoryId" placeholder="请选择分类" allowClear>
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </a-select-option>
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

    <!-- 操作区域 -->
    <a-card class="table-card">
      <div class="table-header">
        <div class="table-title">人员列表</div>
        <a-space>
          <a-button type="primary" @click="openCreate">
            <PlusOutlined /> 新增
          </a-button>
          <a-button @click="handleImport">
            <UploadOutlined /> 导入
          </a-button>
          <a-button @click="handleExport">
            <DownloadOutlined /> 导出
          </a-button>
        </a-space>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
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
          <template v-if="column.key === 'category'">
            {{ getCategoryName(record.categoryId) }}
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag.id" :color="tag.color">
              {{ tag.name }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showDetailModal(record)">查看</a-button>
              <a-button type="link" size="small" @click="openEditWithTags(record)">编辑</a-button>
              <a-popconfirm title="确定要删除此人员吗？" @confirm="handleDelete(record.id)">
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
      :title="isEdit ? '编辑人员' : '录入人员'"
      :loading="submitLoading"
      @confirm="handleSubmit"
      @cancel="close"
      :width="'60vw'"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="人员照片" name="photo">
              <AvatarUpload v-model="formState.photo" placeholder="上传图片" hint="5M以内，支持PNG/JPG格式" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="gender">
              <a-radio-group v-model:value="formState.gender">
                <a-radio value="male">男</a-radio>
                <a-radio value="female">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="formState.name" placeholder="请输入" />
            </a-form-item>
          </a-col>
           <a-col :span="12">
            <a-form-item label="身份证号" name="idCard">
              <a-input v-model:value="formState.idCard" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="出生日期" name="birthDate">
              <a-date-picker v-model:value="formState.birthDate" style="width: 100%" placeholder="请输入" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
           <a-col :span="12">
            <a-form-item label="分类" name="categoryId">
              <a-select v-model:value="formState.categoryId" placeholder="请选择">
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
           <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="formState.phone" placeholder="请输入" />
            </a-form-item>
          </a-col>
           <a-col :span="12">
            <a-form-item label="现住址" name="address">
              <a-input v-model:value="formState.address" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="标签" name="tagIds">
               <div class="tag-selector">
                 <a-checkable-tag 
                   v-for="tag in tags" 
                   :key="tag.id"
                   :checked="formState.tagIds?.includes(tag.id)"
                   @change="checked => handleTagChange(tag.id, checked)"
                 >
                   {{ tag.name }}
                 </a-checkable-tag>
               </div>
            </a-form-item>
          </a-col>
          
          <!-- 六维能力 -->
          <a-col :span="24">
            <a-divider orientation="left">能力维度</a-divider>
          </a-col>
          <a-col :span="8">
            <a-form-item label="领导能力" name="leadershipAbility">
              <a-input-number v-model:value="formState.leadershipAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="团队合作" name="teamworkAbility">
              <a-input-number v-model:value="formState.teamworkAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="沟通能力" name="communicationAbility">
              <a-input-number v-model:value="formState.communicationAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="管理技巧" name="managementAbility">
              <a-input-number v-model:value="formState.managementAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="军事能力" name="militaryAbility">
              <a-input-number v-model:value="formState.militaryAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="专业能力" name="professionalAbility">
              <a-input-number v-model:value="formState.professionalAbility" :min="0" :max="100" placeholder="0-100" style="width: 100%" />
            </a-form-item>
          </a-col>
          
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <a-textarea v-model:value="formState.remark" :rows="3" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <!-- 更多字段可按需添加 -->
        </a-row>
      </a-form>
    </FormDrawer>
    
    
    <!-- 详情抽屉 -->
    <PersonnelDetailDrawer
      v-model:open="detailVisible"
      :personnel="currentRecord"
    />


    <!-- 导入弹窗 -->
    <a-modal v-model:open="importVisible" title="导入人员数据" @ok="confirmImport" @cancel="importVisible = false">
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :multiple="false"
        :beforeUpload="file => { fileList = [file]; return false }"
        accept=".xlsx,.xls"
      >
        <p class="ant-upload-drag-icon"><InboxOutlined /></p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持 .xlsx, .xls 格式的Excel文件</p>
      </a-upload-dragger>
      <a-button type="link" @click="downloadTemplate" class="mt-4"><DownloadOutlined /> 下载导入模板</a-button>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  SearchOutlined, ReloadOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, 
  UserOutlined, InboxOutlined 
} from '@ant-design/icons-vue'
import { personnelApi, tagApi, categoryApi, positionApi } from '@/api'
import type { Personnel, Tag, Category } from '@/types'
import { exportToExcel, importFromExcel, downloadTemplate as downloadTpl } from '@/utils/excel'
import { useTable } from '@/composables/useTable'
import { useForm } from '@/composables/useForm'
import FormDrawer from '@/components/FormDrawer/index.vue'
import PersonnelDetailDrawer from '@/components/PersonnelDetailDrawer/index.vue'
import AvatarUpload from '@/components/AvatarUpload/index.vue'



// --- 基础数据 ---
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

onMounted(async () => {
  try {
    const [catRes, tagRes] = await Promise.all([categoryApi.getList(), tagApi.getList()])
    categories.value = catRes.data
    tags.value = tagRes.data
  } catch (e) {
    console.error(e)
  }
})

const getCategoryName = (id?: string) => categories.value.find(c => c.id === id)?.name || '-'

// --- 表格逻辑 (useTable) ---
const columns = [
  { title: '照片', key: 'photo', width: 80, fixed: 'left' },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '性别', key: 'gender', width: 80 },
  { title: '身份证号', dataIndex: 'idCard', key: 'idCard', width: 180 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '分类', key: 'category', width: 120 },
  { title: '标签', key: 'tags', width: 200 },
  { title: '现住址', dataIndex: 'address', key: 'address', ellipsis: true },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const { 
  loading, dataSource, pagination, searchParams, loadData, handleTableChange, handleSearch, resetSearch: resetTableSearch 
} = useTable({
  fetchApi: personnelApi.getList,
  defaultSearchParams: { name: '', idCard: '', categoryId: undefined }
})

// 初始化加载
onMounted(() => loadData())

const resetSearch = () => {
  resetTableSearch()
}

const handleDelete = async (id: string) => {
  try {
    await personnelApi.delete(id)
    message.success('删除成功')
    loadData()
  } catch (e) {
    message.error('删除失败')
  }
}

// --- 表单逻辑 (useForm) ---
const formRules = {
  name: [{ required: true, message: '请输入姓名' }],
  idCard: [
    { required: true, message: '请输入身份证号' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号格式不正确' }
  ],
  gender: [{ required: true, message: '请选择性别' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]
}

const defaultFormState = {
  photo: '', name: '', idCard: '', gender: 'male' as 'male' | 'female', birthDate: '', 
  phone: '', address: '', categoryId: undefined, tagIds: [], remark: '',
  leadershipAbility: 0, teamworkAbility: 0, communicationAbility: 0,
  managementAbility: 0, militaryAbility: 0, professionalAbility: 0
}

const { 
  visible, isEdit, submitLoading, formRef, formState, openCreate, openEdit, close, handleSubmit 
} = useForm<Partial<Personnel> & { tagIds: string[]; leadershipAbility?: number; teamworkAbility?: number; communicationAbility?: number; managementAbility?: number; militaryAbility?: number; professionalAbility?: number }>({
  defaultValues: defaultFormState,
  createApi: async (data) => {
    // 构建能力对象
    const ability = {
      leadershipAbility: data.leadershipAbility || 0,
      teamworkAbility: data.teamworkAbility || 0,
      communicationAbility: data.communicationAbility || 0,
      managementAbility: data.managementAbility || 0,
      militaryAbility: data.militaryAbility || 0,
      professionalAbility: data.professionalAbility || 0
    }
    // 转换 tagIds 为 tags 对象数组
    const submitData = {
      ...data,
      tags: data.tagIds?.map(id => tags.value.find(t => t.id === id)).filter(Boolean),
      ability
    }
    delete (submitData as any).tagIds
    delete (submitData as any).leadershipAbility
    delete (submitData as any).teamworkAbility
    delete (submitData as any).communicationAbility
    delete (submitData as any).managementAbility
    delete (submitData as any).militaryAbility
    delete (submitData as any).professionalAbility
    await personnelApi.create(submitData)
  },
  updateApi: async (id, data) => {
    // 构建能力对象
    const ability = {
      leadershipAbility: data.leadershipAbility || 0,
      teamworkAbility: data.teamworkAbility || 0,
      communicationAbility: data.communicationAbility || 0,
      managementAbility: data.managementAbility || 0,
      militaryAbility: data.militaryAbility || 0,
      professionalAbility: data.professionalAbility || 0
    }
    const submitData = {
      ...data,
      tags: data.tagIds?.map(id => tags.value.find(t => t.id === id)).filter(Boolean),
      ability
    }
    delete (submitData as any).tagIds
    delete (submitData as any).leadershipAbility
    delete (submitData as any).teamworkAbility
    delete (submitData as any).communicationAbility
    delete (submitData as any).managementAbility
    delete (submitData as any).militaryAbility
    delete (submitData as any).professionalAbility
    await personnelApi.update(id, submitData)
  },
  onSuccess: () => loadData()
})

const openEditWithTags = (record: Personnel) => {
  openEdit({
    ...record,
    tagIds: record.tags?.map(t => t.id) || [],
    leadershipAbility: record.ability?.leadershipAbility || 0,
    teamworkAbility: record.ability?.teamworkAbility || 0,
    communicationAbility: record.ability?.communicationAbility || 0,
    managementAbility: record.ability?.managementAbility || 0,
    militaryAbility: record.ability?.militaryAbility || 0,
    professionalAbility: record.ability?.professionalAbility || 0
  })
}

const handleTagChange = (tagId: string, checked: boolean) => {
  if (!formState.tagIds) formState.tagIds = []
  if (checked) {
    formState.tagIds.push(tagId)
  } else {
    const index = formState.tagIds.indexOf(tagId)
    if (index > -1) formState.tagIds.splice(index, 1)
  }
}

// --- 详情 & 导入导出 ---
const detailVisible = ref(false)
const currentRecord = ref<Personnel | null>(null)
const showDetailModal = (record: Personnel) => {
  currentRecord.value = record
  detailVisible.value = true
}

const importVisible = ref(false)
const fileList = ref<any[]>([])
const handleImport = () => {
  fileList.value = []
  importVisible.value = true
}
const confirmImport = async () => {
  if (!fileList.value.length) return message.warning('请选择文件')
  try {
    const data = await importFromExcel<Personnel>(fileList.value[0])
    for (const item of data) await personnelApi.create(item)
    message.success(`成功导入 ${data.length} 条数据`)
    importVisible.value = false
    loadData()
  } catch (e) {
    message.error('导入失败')
  }
}

const handleExport = () => {
  if (!dataSource.value.length) return message.warning('暂无数据')
  const data = dataSource.value.map(item => ({
    姓名: item.name, 身份证号: item.idCard, 性别: item.gender === 'male' ? '男' : '女',
    出生日期: item.birthDate, 联系电话: item.phone, 现住址: item.address,
    分类: getCategoryName(item.categoryId), 标签: item.tags?.map(t => t.name).join(','), 备注: item.remark
  }))
  exportToExcel(data, '人员信息')
}

const downloadTemplate = () => {
  downloadTpl([{ 姓名: '张三', 身份证号: '110101199001011234', 性别: '男' }], '人员信息导入模板')
}
</script>

<style scoped lang="less">
.personnel-input {
  .search-card { margin-bottom: 16px; :deep(.ant-form-item) { margin-bottom: 0; width: 100%; } }
  .table-header { display: flex; justify-content: space-between; margin-bottom: 16px; .table-title { font-size: 16px; font-weight: 500; } }
}
.tag-selector { display: flex; flex-wrap: wrap; gap: 8px; :deep(.ant-tag-checkable) { border: 1px solid #d9d9d9; } }
.mt-4 { margin-top: 16px; }
.w-full { width: 100%; }
</style>


