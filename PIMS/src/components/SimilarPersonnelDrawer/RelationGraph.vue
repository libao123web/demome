<template>
  <div class="relation-graph-container">
    <div class="graph-title">
      <LeftOutlined class="back-icon" @click="$emit('back')" />
      <span>相似人员 ({{ similarList.length }})</span>
    </div>
    <div ref="chartRef" class="relation-graph"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Personnel, SimilarPersonnel } from '@/types'

echarts.use([GraphChart, TooltipComponent, CanvasRenderer])

interface Props {
  personnel: Personnel
  similarList: SimilarPersonnel[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  nodeClick: [personnel: Personnel]
  back: []
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 生成圆形分布的坐标，根据相似度调整距离
const getCirclePosition = (index: number, total: number, centerX: number, centerY: number, baseRadius: number, similarity: number) => {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  // 根据相似度调整半径：相似度越高，离中心越近
  // similarity 范围 70-100，映射到更大的半径差异
  // 100% 相似度 → 0.6 倍半径（最近）
  // 70% 相似度 → 1.2 倍半径（最远）
  const radiusRatio = 0.6 + (100 - similarity) / 100 * 0.6
  const radius = baseRadius * radiusRatio
  
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  }
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  // 监听节点点击事件
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data) {
      const nodeData = params.data
      if (nodeData.id === props.personnel.id) {
        emit('nodeClick', props.personnel)
      } else {
        const similar = props.similarList.find(s => s.id === nodeData.id)
        if (similar) {
          emit('nodeClick', similar.personnel)
        }
      }
    }
  })
  
  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !chartRef.value) return
  
  const width = chartRef.value.clientWidth || 800
  const height = chartRef.value.clientHeight || 600
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.35

  // 默认头像（使用 data URL 生成圆形头像）
  const defaultAvatarCenter = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#ff7875"/>
          <stop offset="100%" style="stop-color:#ff4d4f"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad1)" stroke="#fff" stroke-width="4"/>
      <circle cx="50" cy="35" r="15" fill="#fff" opacity="0.9"/>
      <ellipse cx="50" cy="75" rx="25" ry="20" fill="#fff" opacity="0.9"/>
    </svg>
  `)
  
  const defaultAvatarSimilar = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#69c0ff"/>
          <stop offset="100%" style="stop-color:#1890ff"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad2)" stroke="#fff" stroke-width="3"/>
      <circle cx="50" cy="35" r="15" fill="#fff" opacity="0.9"/>
      <ellipse cx="50" cy="75" rx="25" ry="20" fill="#fff" opacity="0.9"/>
    </svg>
  `)

  // 获取带圆形边框的头像 symbol
  const getAvatarSymbol = (photo: string | undefined, isCenter: boolean) => {
    if (photo) {
      return `image://${photo}`
    }
    return isCenter ? `image://${defaultAvatarCenter}` : `image://${defaultAvatarSimilar}`
  }

  // 构建节点数据 - 使用固定位置的圆形布局
  const nodes = [
    // 中心节点（当前人员）
    {
      id: props.personnel.id,
      name: props.personnel.name,
      x: centerX,
      y: centerY,
      fixed: true,
      symbol: getAvatarSymbol(props.personnel.photo, true),
      symbolSize: 90,
      itemStyle: {
        borderColor: '#ff4d4f',
        borderWidth: 4,
        shadowBlur: 20,
        shadowColor: 'rgba(255, 77, 79, 0.5)',
        borderRadius: 45
      },
      label: {
        show: true,
        position: 'bottom',
        distance: 10,
        formatter: '{b}',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    // 相似人员节点 - 环形分布
    ...props.similarList.map((similar, index) => {
      const pos = getCirclePosition(index, props.similarList.length, centerX, centerY, radius, similar.similarity)
      return {
        id: similar.id,
        name: similar.name,
        x: pos.x,
        y: pos.y,
        fixed: true,
        symbol: getAvatarSymbol(similar.photo, false),
        symbolSize: 65,
        itemStyle: {
          borderColor: '#1890ff',
          borderWidth: 3,
          shadowBlur: 15,
          shadowColor: 'rgba(24, 144, 255, 0.4)',
          borderRadius: 32
        },
        label: {
          show: false
        }
      }
    })
  ]

  // 构建连线数据
  const links = props.similarList.map(similar => ({
    source: props.personnel.id,
    target: similar.id,
    lineStyle: {
      color: '#5CADFF',
      width: 2,
      curveness: 0  // 使用直线，不弯曲
    },
    label: {
      show: true,
      formatter: `${similar.similarity}%相似`,
      fontSize: 11,
      color: '#666',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: [3, 6],
      borderRadius: 4
    }
  }))

  const option: echarts.EChartsCoreOption = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<div style="font-weight: bold">${params.data.name}</div>`
        }
        return ''
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        data: nodes,
        links: links,
        roam: true,
        cursor: 'pointer',
        emphasis: {
          focus: 'adjacency',
          scale: 1.2,
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  }

  chartInstance.setOption(option, true)
}

const resize = () => {
  if (chartInstance) {
    chartInstance.resize()
    nextTick(() => {
      updateChart()
    })
  }
}

watch(() => props.similarList, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    initChart()
  }, 100)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="less">
.relation-graph-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f4fc 0%, #f0f5f9 100%);
  
  .graph-title {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    font-size: 18px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #e8e8e8;
    background: rgba(255, 255, 255, 0.8);
    
    .back-icon {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.3s;
      
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
  
  .relation-graph {
    flex: 1;
    width: 100%;
    min-height: 500px;
  }
}
</style>
