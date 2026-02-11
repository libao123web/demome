<template>
  <a-drawer
    v-model:open="visible"
    :title="null"
    :closable="true"
    :width="'100%'"
    :bodyStyle="{ padding: 0, height: '100%' }"
    :headerStyle="{ display: 'none' }"
    @close="handleClose"
  >
    <div class="similar-personnel-container">
      <!-- 关系图 -->
      <div class="relation-graph-wrapper">
        <RelationGraph
          v-if="personnel"
          :personnel="personnel"
          :similar-list="similarList"
          @node-click="handleNodeClick"
          @back="handleClose"
        />
      </div>
      
      <!-- 人员详情面板 -->
      <transition name="slide">
        <div v-if="selectedPersonnel" class="detail-panel">
          <div class="detail-header">
            <span class="detail-title">{{ selectedPersonnel.name }}</span>
            <a-button type="text" size="small" @click="selectedPersonnel = null">
              <CloseOutlined />
            </a-button>
          </div>
          
          <div class="detail-content">
            <!-- 基本信息标签 -->
            <div class="info-tags">
              <a-tag v-if="selectedPersonnel.gender" color="blue">
                {{ selectedPersonnel.gender === 'male' ? '男性' : '女性' }}
              </a-tag>
              <a-tag v-if="selectedPersonnel.ethnicity" color="cyan">{{ selectedPersonnel.ethnicity }}</a-tag>
              <a-tag v-if="selectedPersonnel.education" color="purple">{{ selectedPersonnel.education }}</a-tag>
              <a-tag v-if="selectedPersonnel.politicalStatus" color="red">{{ selectedPersonnel.politicalStatus }}</a-tag>
              <a-tag v-if="selectedPersonnel.militaryRank" color="orange">{{ selectedPersonnel.militaryRank }}</a-tag>
              <a-tag v-if="selectedPersonnel.maritalStatus" color="green">{{ selectedPersonnel.maritalStatus }}</a-tag>
            </div>
            
            <!-- 人员标签 -->
            <div v-if="selectedPersonnel.tags && selectedPersonnel.tags.length" class="personnel-tags">
              <div class="section-subtitle">人员标签</div>
              <div class="tags-wrapper">
                <a-tag v-for="tag in selectedPersonnel.tags" :key="tag.id" color="processing">
                  {{ tag.name }}
                </a-tag>
              </div>
            </div>
            
            <!-- 能力雷达图 -->
            <div v-if="selectedPersonnel.ability" class="ability-section">
              <div class="section-title">
                <span class="title-text">领导能力分</span>
                <a-tag color="blue">{{ getAbilityLabel(selectedPersonnel.ability.leadershipAbility) }}</a-tag>
              </div>
              <div class="section-title">
                <span class="title-text">沟通能力分</span>
                <a-tag color="cyan">{{ getAbilityLabel(selectedPersonnel.ability.communicationAbility) }}</a-tag>
              </div>
              <div style="margin: 20px 0;">
                <AbilityRadar :data="selectedPersonnel.ability" :size="240" />
              </div>
              <div class="section-title">
                <span class="title-text">管理能力分</span>
                <a-tag color="purple">{{ getAbilityLabel(selectedPersonnel.ability.managementAbility) }}</a-tag>
              </div>
              <div class="section-title">
                <span class="title-text">专业能力分</span>
                <a-tag color="orange">{{ getAbilityLabel(selectedPersonnel.ability.professionalAbility) }}</a-tag>
              </div>
              <div class="ability-note">
                <a-tag color="error">古玩技巧</a-tag>
              </div>
            </div>
            
            <!-- 其他信息 -->
            <div class="other-info">
              <div v-if="selectedPersonnel.phone" class="info-item">
                <span class="label">手机号：</span>
                <span class="value">{{ selectedPersonnel.phone }}</span>
              </div>
              <div v-if="selectedPersonnel.idCard" class="info-item">
                <span class="label">身份证：</span>
                <span class="value">{{ selectedPersonnel.idCard }}</span>
              </div>
              <div v-if="selectedPersonnel.address" class="info-item">
                <span class="label">现住址：</span>
                <span class="value">{{ selectedPersonnel.address }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import type { Personnel, SimilarPersonnel } from '@/types'
import { personnelApi } from '@/api'
import RelationGraph from './RelationGraph.vue'
import AbilityRadar from '@/components/AbilityRadar/index.vue'

interface Props {
  open: boolean
  personnel: Personnel | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const visible = ref(props.open)
const similarList = ref<SimilarPersonnel[]>([])
const selectedPersonnel = ref<Personnel | null>(null)

// 模拟获取相似人员数据
const loadSimilarPersonnel = async () => {
  if (!props.personnel) return
  
  // TODO: 调用实际API
  // const res = await personnelApi.getSimilar(props.personnel.id)
  // similarList.value = res
  
  // 模拟数据 - 生成15个相似人员
  const personnelList = await personnelApi.getList({ page: 1, pageSize: 20 })
  const allPersonnel = personnelList.data.filter(p => p.id !== props.personnel!.id)
  
  similarList.value = allPersonnel.slice(0, 15).map((p, i) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
    similarity: Math.floor(Math.random() * 30) + 70, // 70-100
    personnel: {
      ...p,
      ability: p.ability || {
        leadershipAbility: Math.floor(Math.random() * 31) + 70,
        teamworkAbility: Math.floor(Math.random() * 31) + 70,
        communicationAbility: Math.floor(Math.random() * 31) + 70,
        managementAbility: Math.floor(Math.random() * 31) + 70,
        militaryAbility: Math.floor(Math.random() * 31) + 70,
        professionalAbility: Math.floor(Math.random() * 31) + 70
      }
    }
  }))
}

const handleClose = () => {
  emit('update:open', false)
  selectedPersonnel.value = null
}

const handleNodeClick = (personnel: Personnel) => {
  selectedPersonnel.value = personnel
}

// 获取能力等级标签
const getAbilityLabel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '待提升'
}

watch(() => props.open, (val) => {
  visible.value = val
  if (val) {
    loadSimilarPersonnel()
  }
})

watch(visible, (val) => {
  emit('update:open', val)
})
</script>

<style scoped lang="less">
.similar-personnel-container {
  position: relative;
  height: calc(100vh);
  display: flex;
}

.relation-graph-wrapper {
  flex: 1;
  height: 100%;
  min-height: 100vh;
}

.detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 420px;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
    
    .detail-title {
      font-size: 18px;
      font-weight: 600;
    }
    
    :deep(.ant-btn) {
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    .info-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .personnel-tags {
      margin-bottom: 24px;
      
      .section-subtitle {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 8px;
        color: rgba(0, 0, 0, 0.65);
      }
      
      .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }
    
    .ability-section {
      margin-bottom: 20px;
      
      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .title-text {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.65);
        }
      }
      
      .ability-note {
        text-align: center;
        margin-top: 12px;
      }
    }
    
    .other-info {
      .info-item {
        margin-bottom: 12px;
        font-size: 14px;
        
        .label {
          color: rgba(0, 0, 0, 0.45);
        }
        
        .value {
          color: rgba(0, 0, 0, 0.85);
        }
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
