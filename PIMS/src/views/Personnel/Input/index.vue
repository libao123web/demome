<template>
  <div class="personnel-input">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="[16, 16]" class="w-full">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="姓名" class="w-full">
              <a-input v-model:value="searchForm.name" placeholder="请输入姓名" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="身份证号" class="w-full">
              <a-input v-model:value="searchForm.idCard" placeholder="请输入身份证号" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="分类" class="w-full">
              <a-select v-model:value="searchForm.categoryId" placeholder="请选择分类" allowClear>
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </a-select-option>
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

    <!-- 操作区域 -->
    <a-card class="table-card">
      <div class="table-header">
        <div class="table-title">人员列表</div>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <PlusOutlined />
            新增
          </a-button>
          <a-button @click="handleImport">
            <UploadOutlined />
            导入
          </a-button>
          <a-button @click="handleExport">
            <DownloadOutlined />
            导出
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
            <a-avatar v-if="record.photo" :src="record.photo" :size="40" />
            <a-avatar v-else :size="40">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>
          <template v-if="column.key === 'gender'">
            {{ record.gender === 'male' ? '男' : '女' }}
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag.id" :color="tag.color">
              {{ tag.name }}
            </a-tag>
          </template>
          <template v-if="column.key === 'category'">
            {{ getCategoryName(record.categoryId) }}
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
                title="确定要删除此人员吗？"
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
      width="800px"
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
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="formState.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="身份证号" name="idCard">
              <a-input v-model:value="formState.idCard" placeholder="请输入身份证号" />
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
            <a-form-item label="出生日期" name="birthDate">
              <a-date-picker 
                v-model:value="formState.birthDate" 
                style="width: 100%" 
                placeholder="请选择出生日期"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="民族" name="ethnicity">
              <a-select v-model:value="formState.ethnicity" placeholder="请选择民族">
                <a-select-option v-for="e in ethnicities" :key="e" :value="e">{{ e }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="籍贯" name="nativePlace">
              <a-input v-model:value="formState.nativePlace" placeholder="请输入籍贯" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="政治面貌" name="politicalStatus">
              <a-select v-model:value="formState.politicalStatus" placeholder="请选择政治面貌">
                <a-select-option value="党员">党员</a-select-option>
                <a-select-option value="团员">团员</a-select-option>
                <a-select-option value="群众">群众</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="学历" name="education">
              <a-select v-model:value="formState.education" placeholder="请选择学历">
                <a-select-option value="博士">博士</a-select-option>
                <a-select-option value="硕士">硕士</a-select-option>
                <a-select-option value="本科">本科</a-select-option>
                <a-select-option value="专科">专科</a-select-option>
                <a-select-option value="高中">高中</a-select-option>
                <a-select-option value="初中">初中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone">
              <a-input v-model:value="formState.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类" name="categoryId">
              <a-select v-model:value="formState.categoryId" placeholder="请选择分类">
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职务" name="positionId">
              <a-select v-model:value="formState.positionId" placeholder="请选择职务">
                <a-select-option v-for="pos in positions" :key="pos.id" :value="pos.id">
                  {{ pos.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="标签" name="tagIds">
              <a-select v-model:value="formState.tagIds" mode="multiple" placeholder="请选择标签">
                <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="现住址" name="address">
              <a-input v-model:value="formState.address" placeholder="请输入现住址" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="工作单位" name="workplace">
              <a-input v-model:value="formState.workplace" placeholder="请输入工作单位" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <a-textarea v-model:value="formState.remark" :rows="3" placeholder="请输入备注" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="人员详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentRecord">
        <a-descriptions-item label="姓名">{{ currentRecord.name }}</a-descriptions-item>
        <a-descriptions-item label="身份证号">{{ currentRecord.idCard }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{ currentRecord.gender === 'male' ? '男' : '女' }}</a-descriptions-item>
        <a-descriptions-item label="出生日期">{{ currentRecord.birthDate }}</a-descriptions-item>
        <a-descriptions-item label="民族">{{ currentRecord.ethnicity }}</a-descriptions-item>
        <a-descriptions-item label="籍贯">{{ currentRecord.nativePlace }}</a-descriptions-item>
        <a-descriptions-item label="政治面貌">{{ currentRecord.politicalStatus }}</a-descriptions-item>
        <a-descriptions-item label="学历">{{ currentRecord.education }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ currentRecord.phone }}</a-descriptions-item>
        <a-descriptions-item label="分类">{{ getCategoryName(currentRecord.categoryId) }}</a-descriptions-item>
        <a-descriptions-item label="标签" :span="2">
          <a-tag v-for="tag in currentRecord.tags" :key="tag.id" :color="tag.color">
            {{ tag.name }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="现住址" :span="2">{{ currentRecord.address }}</a-descriptions-item>
        <a-descriptions-item label="工作单位" :span="2">{{ currentRecord.workplace }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord.remark }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 导入弹窗 -->
    <a-modal
      v-model:open="importVisible"
      title="导入人员数据"
      @ok="confirmImport"
      @cancel="importVisible = false"
    >
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :multiple="false"
        :beforeUpload="beforeUpload"
        accept=".xlsx,.xls"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持 .xlsx, .xls 格式的Excel文件</p>
      </a-upload-dragger>
      <a-button type="link" @click="downloadTemplate" class="mt-4">
        <DownloadOutlined />
        下载导入模板
      </a-button>
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
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  UserOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { personnelApi, tagApi, categoryApi, positionApi } from '@/api'
import type { Personnel, Tag, Category, Position } from '@/types'
import { exportToExcel, importFromExcel, downloadTemplate as downloadTpl } from '@/utils/excel'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const dataSource = ref<Personnel[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const positions = ref<Position[]>([])

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
  name: '',
  idCard: '',
  categoryId: undefined as string | undefined
})

// 民族列表
const ethnicities = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族',
  '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族'
]

// 表格列
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

// 弹窗状态
const modalVisible = ref(false)
const detailVisible = ref(false)
const importVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<Personnel | null>(null)
const formRef = ref<FormInstance>()
const fileList = ref<any[]>([])

// 表单数据
const formState = reactive<Partial<Personnel> & { tagIds?: string[] }>({
  name: '',
  idCard: '',
  gender: 'male',
  birthDate: '',
  ethnicity: '',
  nativePlace: '',
  politicalStatus: '',
  education: '',
  phone: '',
  address: '',
  workplace: '',
  categoryId: undefined,
  positionId: undefined,
  tagIds: [],
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入姓名' }],
  idCard: [
    { required: true, message: '请输入身份证号' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号格式不正确' }
  ],
  gender: [{ required: true, message: '请选择性别' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]
}

const modalTitle = computed(() => isEdit.value ? '编辑人员' : '新增人员')

// 获取分类名称
const getCategoryName = (categoryId?: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.name || '-'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await personnelApi.getList({
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

// 加载基础数据
const loadBaseData = async () => {
  try {
    const [catRes, tagRes, posRes] = await Promise.all([
      categoryApi.getList(),
      tagApi.getList(),
      positionApi.getList()
    ])
    categories.value = catRes.data
    tags.value = tagRes.data
    positions.value = posRes.data
  } catch (error) {
    console.error('加载基础数据失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.idCard = ''
  searchForm.categoryId = undefined
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
const showEditModal = (record: Personnel) => {
  isEdit.value = true
  Object.assign(formState, {
    ...record,
    tagIds: record.tags?.map(t => t.id) || []
  })
  currentRecord.value = record
  modalVisible.value = true
}

// 显示详情弹窗
const showDetailModal = (record: Personnel) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    name: '',
    idCard: '',
    gender: 'male',
    birthDate: '',
    ethnicity: '',
    nativePlace: '',
    politicalStatus: '',
    education: '',
    phone: '',
    address: '',
    workplace: '',
    categoryId: undefined,
    positionId: undefined,
    tagIds: [],
    remark: ''
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    // 构建提交数据，将tagIds转换为tags
    const submitData = {
      ...formState,
      tags: formState.tagIds?.map(id => tags.value.find(t => t.id === id)).filter(Boolean)
    }
    delete (submitData as any).tagIds
    
    if (isEdit.value) {
      await personnelApi.update(currentRecord.value!.id, submitData as Personnel)
      message.success('更新成功')
    } else {
      await personnelApi.create(submitData as Personnel)
      message.success('新增成功')
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
    await personnelApi.delete(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

// 导入
const handleImport = () => {
  fileList.value = []
  importVisible.value = true
}

// 导入前检查
const beforeUpload = (file: File) => {
  fileList.value = [file]
  return false
}

// 确认导入
const confirmImport = async () => {
  if (fileList.value.length === 0) {
    message.warning('请选择文件')
    return
  }
  
  try {
    const file = fileList.value[0]
    const data = await importFromExcel<Personnel>(file)
    
    // 批量创建
    for (const item of data) {
      await personnelApi.create(item)
    }
    
    message.success(`成功导入 ${data.length} 条数据`)
    importVisible.value = false
    loadData()
  } catch (error) {
    message.error('导入失败')
  }
}

// 导出
const handleExport = () => {
  if (dataSource.value.length === 0) {
    message.warning('暂无数据可导出')
    return
  }
  
  const exportData = dataSource.value.map(item => ({
    姓名: item.name,
    身份证号: item.idCard,
    性别: item.gender === 'male' ? '男' : '女',
    出生日期: item.birthDate,
    民族: item.ethnicity,
    籍贯: item.nativePlace,
    政治面貌: item.politicalStatus,
    学历: item.education,
    联系电话: item.phone,
    现住址: item.address,
    工作单位: item.workplace,
    分类: getCategoryName(item.categoryId),
    标签: item.tags?.map(t => t.name).join(',') || '',
    备注: item.remark
  }))
  
  exportToExcel(exportData, '人员信息')
}

// 下载模板
const downloadTemplate = () => {
  const templateData = [
    {
      姓名: '张三',
      身份证号: '110101199001011234',
      性别: '男',
      出生日期: '1990-01-01',
      民族: '汉族',
      籍贯: '北京',
      政治面貌: '党员',
      学历: '本科',
      联系电话: '13800138000',
      现住址: '北京市朝阳区xxx',
      工作单位: 'xxx公司',
      备注: ''
    }
  ]
  downloadTpl(templateData, '人员信息导入模板')
}

onMounted(() => {
  loadBaseData()
  loadData()
})
</script>

<style scoped lang="less">
.personnel-input {
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

.mt-4 {
  margin-top: 16px;
}
</style>
