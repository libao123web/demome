<template>
  <div class="ability-radar-wrapper">
    <!-- 雷达图 -->
    <div class="chart-container" :style="{ width: '450px', height: '450px' }">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { PersonnelAbility } from '@/types'

// 注册 ECharts 组件
use([RadarChart, TooltipComponent, CanvasRenderer])

interface Props {
  data?: PersonnelAbility
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 400
})

// 雷达图配置
const chartOption = computed(() => {
  const values = props.data ? [
    props.data.leadershipAbility || 0,
    props.data.teamworkAbility || 0,
    props.data.communicationAbility || 0,
    props.data.managementAbility || 0,
    props.data.militaryAbility || 0,
    props.data.professionalAbility || 0
  ] : [0, 0, 0, 0, 0, 0]
  console.log(values)
  return {
    radar: {
      indicator: [
        { name: '领导能力', max: 100 },
        { name: '团队合作', max: 100 },
        { name: '沟通能力', max: 100 },
        { name: '管理技巧', max: 100 },
        { name: '军事能力', max: 100 },
        { name: '专业能力', max: 100 }
      ],
      radius: '65%'
    },
    series: [{
      type: 'radar',
      label: {
        show: true,
        formatter: '{c}'
      },
      data: [{
        value: values,
        name: '能力值',
        areaStyle: {
          color: 'rgba(255, 193, 7, 0.3)'
        },
        itemStyle: {
          color: '#FF9800'
        },
        lineStyle: {
          color: '#FF9800'
        }
      }]
    }]
  }
})
</script>

<style scoped lang="less">
.ability-radar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .chart-container {
    :deep(.vue-echarts) {
      width: 100% !important;
      height: 100% !important;
    }
  }
}
</style>
