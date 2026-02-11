<template>
  <a-drawer
    v-model:open="visible"
    :title="title"
    placement="right"
    :width="computedWidth"
    :closable="true"
    :maskClosable="true"
    :destroyOnClose="true"
    @close="handleClose"
    @afterOpenChange="handleAfterOpenChange"
  >
    <div class="form-drawer-content">
      <slot></slot>
    </div>
    
    <template #footer>
      <div class="form-drawer-footer">
        <a-space>
          <a-button @click="handleClose" :disabled="loading">
            取消
          </a-button>
          <a-button type="primary" @click="handleConfirm" :loading="loading">
            {{ confirmText }}
          </a-button>
        </a-space>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  open: boolean
  title: string
  width?: number | string
  loading?: boolean
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 720,
  loading: false,
  confirmText: '确定'
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const visible = ref(false)

// 响应式宽度计算
const computedWidth = computed(() => {
  if (typeof props.width === 'string') {
    return props.width
  }
  
  const screenWidth = window.innerWidth
  const halfScreen = Math.floor(screenWidth * 0.5)
  const minWidth = props.width
  const maxWidth = props.width * 2
  
  // 至少占50%屏幕，但不小于设定的最小值，不大于最大值
  return Math.max(minWidth, Math.min(maxWidth, halfScreen))
})

// 同步 open 属性
watch(() => props.open, (val) => {
  visible.value = val
}, { immediate: true })

watch(visible, (val) => {
  emit('update:open', val)
})

const handleClose = () => {
  if (!props.loading) {
    visible.value = false
    emit('cancel')
  }
}

const handleAfterOpenChange = (open: boolean) => {
  // 当抽屉完全关闭后触发，用于清理表单状态
  if (!open) {
    emit('cancel')
  }
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped lang="less">
.form-drawer-content {
  min-height: calc(100vh - 150px);
}

.form-drawer-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
  background: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

:deep(.ant-drawer-body) {
  padding-bottom: 72px;
}
</style>
