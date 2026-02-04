<template>
  <a-config-provider :locale="zhCN" :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

// 亮色主题配置
const themeConfig = ref<ThemeConfig>({
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorBgLayout: '#f0f2f5',
    borderRadius: 6,
  },
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
