<template>
  <a-modal
    v-model:open="visible"
    title="导入数据"
    width="520px"
    @ok="handleOk"
    @cancel="handleCancel"
    :okButtonProps="{ disabled: !importData.length }"
    :confirmLoading="loading"
  >
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :before-upload="handleBeforeUpload"
      accept=".xlsx,.xls"
      :show-upload-list="false"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p class="ant-upload-hint">支持 .xlsx, .xls 格式的Excel文件</p>
    </a-upload-dragger>

    <!-- 解析结果预览 -->
    <div v-if="importData.length" class="preview-section">
      <a-divider>数据预览</a-divider>
      <a-alert
        :message="`已解析 ${importData.length} 条数据`"
        type="success"
        show-icon
        class="mb-3"
      />
      <a-table
        :columns="previewColumns"
        :data-source="importData.slice(0, 5)"
        :pagination="false"
        size="small"
        :scroll="{ x: true }"
      />
      <div v-if="importData.length > 5" class="preview-tip">
        ... 还有 {{ importData.length - 5 }} 条数据
      </div>
    </div>

    <!-- 模板下载 -->
    <div class="template-section">
      <a-button type="link" @click="downloadTemplate">
        <DownloadOutlined />
        下载导入模板
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { importFromExcel, downloadTemplate as downloadTpl } from '@/utils/excel'

interface Props {
  open: boolean
  templateData?: Record<string, any>[]
  templateName?: string
  fieldMapping?: Record<string, string> // Excel列名 -> 字段名映射
}

const props = withDefaults(defineProps<Props>(), {
  templateData: () => [],
  templateName: '导入模板',
  fieldMapping: () => ({})
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'import', data: any[]): void
}>()

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const loading = ref(false)
const fileList = ref<any[]>([])
const importData = ref<any[]>([])

// 预览列
const previewColumns = computed(() => {
  if (importData.value.length === 0) return []
  const firstItem = importData.value[0]
  return Object.keys(firstItem).slice(0, 5).map(key => ({
    title: key,
    dataIndex: key,
    key,
    ellipsis: true,
    width: 120
  }))
})

// 文件上传前处理
const handleBeforeUpload = async (file: File) => {
  try {
    const data = await importFromExcel<Record<string, any>>(file)
    
    // 如果有字段映射，进行转换
    if (Object.keys(props.fieldMapping).length > 0) {
      importData.value = data.map(item => {
        const mapped: Record<string, any> = {}
        Object.entries(item).forEach(([key, value]) => {
          const fieldName = props.fieldMapping[key] || key
          mapped[fieldName] = value
        })
        return mapped
      })
    } else {
      importData.value = data
    }
    
    message.success(`成功解析 ${data.length} 条数据`)
  } catch (error) {
    message.error('文件解析失败，请检查文件格式')
  }
  
  return false // 阻止自动上传
}

// 确认导入
const handleOk = () => {
  if (importData.value.length === 0) {
    message.warning('请先上传文件')
    return
  }
  
  loading.value = true
  emit('import', importData.value)
}

// 取消
const handleCancel = () => {
  fileList.value = []
  importData.value = []
  visible.value = false
}

// 下载模板
const downloadTemplate = () => {
  if (props.templateData.length > 0) {
    downloadTpl(props.templateData, props.templateName)
  } else {
    message.warning('暂无模板可下载')
  }
}

// 监听关闭重置数据
watch(visible, (val) => {
  if (!val) {
    fileList.value = []
    importData.value = []
    loading.value = false
  }
})

// 暴露方法给父组件
defineExpose({
  reset: () => {
    loading.value = false
    fileList.value = []
    importData.value = []
  }
})
</script>

<style scoped lang="less">
.preview-section {
  margin-top: 16px;
  
  .preview-tip {
    text-align: center;
    color: #999;
    font-size: 13px;
    margin-top: 8px;
  }
}

.template-section {
  margin-top: 16px;
  text-align: center;
}

.mb-3 {
  margin-bottom: 12px;
}
</style>
