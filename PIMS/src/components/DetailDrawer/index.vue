<template>
  <a-drawer
    v-model:open="visible"
    :title="title"
    placement="right"
    :width="computedWidth"
    :closable="true"
    :maskClosable="true"
    @close="handleClose"
  >
    <div class="detail-drawer-content">
      <slot></slot>
    </div>
    
    <template #footer>
      <div class="detail-drawer-footer">
        <a-button type="primary" @click="handleClose">
          关闭
        </a-button>
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
}

const props = withDefaults(defineProps<Props>(), {
  width: 800
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
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
  const maxWidth = props.width * 1.5
  
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
  visible.value = false
}
</script>

<style scoped lang="less">
.detail-drawer-content {
  min-height: calc(100vh - 150px);
}

.detail-drawer-footer {
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
