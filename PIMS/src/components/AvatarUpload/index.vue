<template>
  <div class="avatar-upload">
    <a-upload
      name="avatar"
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <div v-if="imageUrl" class="avatar-container">
        <img :src="imageUrl" alt="avatar" class="avatar-image" />
        <div class="avatar-overlay">
          <CameraOutlined />
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <plus-outlined />
        <div class="upload-text">{{ placeholder }}</div>
      </div>
    </a-upload>
    <div class="upload-hint" v-if="hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, CameraOutlined } from '@ant-design/icons-vue'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'

interface Props {
  modelValue?: string
  placeholder?: string
  hint?: string
  maxSize?: number // MB
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '上传图片',
  hint: '5M以内，支持PNG/JPG格式',
  maxSize: 5
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const imageUrl = ref(props.modelValue || '')

watch(() => props.modelValue, (val) => {
  imageUrl.value = val || ''
})

// 上传前检查
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLtMax = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMax) {
    message.error(`图片大小不能超过 ${props.maxSize}MB!`)
    return false
  }
  return true
}

// 处理上传变化 - 转换为 base64
const handleChange = (info: UploadChangeParam<UploadFile>) => {
  const file = info.file.originFileObj as File
  if (file) {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      imageUrl.value = reader.result as string
      emit('update:modelValue', imageUrl.value)
    })
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped lang="less">
.avatar-upload {
  .avatar-uploader {
    :deep(.ant-upload) {
      width: 104px;
      height: 104px;
      border-radius: 4px;
      overflow: hidden;
    }
  }
  
  .avatar-container {
    position: relative;
    width: 100%;
    height: 100%;
    
    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      color: #fff;
      font-size: 24px;
    }
    
    &:hover .avatar-overlay {
      opacity: 1;
    }
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    
    .upload-text {
      margin-top: 8px;
      font-size: 12px;
    }
  }
  
  .upload-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }
}
</style>
