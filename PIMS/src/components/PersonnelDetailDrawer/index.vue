<template>
  <a-drawer
    v-model:open="visible"
    title="人员详情"
    :width="'100%'"
    :bodyStyle="{ padding: 0, background: '#f0f2f5' }"
    @close="handleClose"
  >
    <div v-if="personnel" class="personnel-detail">
      <!-- 主体内容 -->
      <div class="detail-content">
        <!-- 左侧信息区 -->
        <div class="detail-left">
          <!-- 照片和基本信息卡片 -->
          <a-card class="info-card" :bordered="false">
            <div class="photo-section">
              <a-avatar v-if="personnel.photo" :src="personnel.photo" :size="80" shape="square" />
              <a-avatar v-else :size="80" shape="square">
                <template #icon><UserOutlined /></template>
              </a-avatar>
            </div>
            
            <div class="basic-info">
              <div class="info-row">
                <span class="label">姓名：</span>
                <span class="value">{{ personnel.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">性别：</span>
                <span class="value">{{ personnel.gender === 'male' ? '男' : '女' }}</span>
              </div>
              <div class="info-row">
                <span class="label">民族：</span>
                <span class="value">{{ personnel.ethnicity || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">文化程度：</span>
                <span class="value">{{ personnel.education || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">政治面貌：</span>
                <span class="value">{{ personnel.politicalStatus || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">出生日期：</span>
                <span class="value">{{ personnel.birthDate || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">籍贯/出生地：</span>
                <span class="value">{{ personnel.nativePlace || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">婚姻状况：</span>
                <span class="value">{{ personnel.maritalStatus || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">联系电话：</span>
                <span class="value">{{ personnel.phone || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">身份证号：</span>
                <span class="value">{{ personnel.idCard }}</span>
              </div>
              <div class="info-row">
                <span class="label">录入时间：</span>
                <span class="value">{{ personnel.createTime || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">现住地址：</span>
                <span class="value">{{ personnel.address || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">主要经历：</span>
                <span class="value">{{ personnel.remark || '-' }}</span>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 右侧能力维度区 -->
        <div class="detail-right">
          <!-- 能力标签卡片 -->
          <a-card class="ability-tags-card" :bordered="false">
            <template #title>
              <div class="card-title">能力标签</div>
            </template>
            
            <div class="ability-tags">
              <a-tag color="blue" class="ability-tag">
                <span class="tag-label">领导能力</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.leadershipAbility }}</span>
              </a-tag>
              <a-tag color="pink" class="ability-tag">
                <span class="tag-label">团队合作</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.teamworkAbility }}</span>
              </a-tag>
              <a-tag color="cyan" class="ability-tag">
                <span class="tag-label">沟通能力</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.communicationAbility }}</span>
              </a-tag>
              <a-tag color="green" class="ability-tag">
                <span class="tag-label">管理技巧</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.managementAbility }}</span>
              </a-tag>
              <a-tag color="orange" class="ability-tag">
                <span class="tag-label">军事能力</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.militaryAbility }}</span>
              </a-tag>
              <a-tag color="purple" class="ability-tag">
                <span class="tag-label">专业能力</span>
                <span v-if="personnel.ability" class="tag-value">{{ personnel.ability.professionalAbility }}</span>
              </a-tag>
            </div>
          </a-card>
          
          <!-- 能力六维图卡片 -->
          <a-card class="ability-radar-card" :bordered="false">
            <template #title>
              <div class="card-title">能力六维图</div>
            </template>
            
            <div v-if="personnel.ability" class="radar-container">
              <AbilityRadar :data="personnel.ability" :size="300" />
            </div>
            <a-empty v-else description="暂无能力数据" />
          </a-card>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue'
import type { Personnel } from '@/types'
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

const handleClose = () => {
  emit('update:open', false)
}

watch(() => props.open, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:open', val)
})
</script>

<style scoped lang="less">
.personnel-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .detail-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 16px;
    overflow: auto;
    
    .detail-left {
      width: 540px;
      flex-shrink: 0;
      height: 100%;
      
      .info-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        
        :deep(.ant-card-body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
        
        .photo-section {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        
        .basic-info {
          flex: 1;
          overflow-y: auto;
          
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #f5f5f5;
            
            &:last-child {
              border-bottom: none;
            }
            
            .label {
              width: 110px;
              color: rgba(0, 0, 0, 0.45);
              flex-shrink: 0;
              font-size: 15px;
            }
            
            .value {
              flex: 1;
              color: rgba(0, 0, 0, 0.85);
              word-break: break-all;
              font-size: 15px;
            }
          }
        }
      }
    }
    
    .detail-right {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .ability-tags-card {
        flex-shrink: 0;
        
        .card-title {
          font-size: 16px;
          font-weight: 500;
        }
        
        .ability-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .ability-tag {
            font-size: 13px;
            padding: 4px 12px;
            display: flex;
            align-items: center;
            gap: 6px;
            
            .tag-label {
              font-weight: 500;
            }
            
            .tag-value {
              font-weight: 600;
              font-size: 14px;
            }
          }
        }
      }
      
      .ability-radar-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        :deep(.ant-card-body) {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .card-title {
          font-size: 16px;
          font-weight: 500;
        }
        
        .radar-container {
          flex: 1;
          width: 100%;
          min-height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}

// 平板适配
@media (max-width: 1200px) {
  .personnel-detail {
    .detail-content {
      .detail-left {
        width: 420px;
        
        .info-card {
          .basic-info {
            .info-row {
              .label {
                width: 90px;
                font-size: 14px;
              }
              
              .value {
                font-size: 14px;
              }
            }
          }
        }
      }
      
      .detail-right {
        .ability-radar-card {
          .radar-container {
            min-height: 320px;
          }
        }
      }
    }
  }
}

// 手机端适配 - 垂直布局
@media (max-width: 768px) {
  .personnel-detail {
    .detail-content {
      flex-direction: column;
      
      .detail-left {
        width: 100%;
      }
      
      .detail-right {
        width: 100%;
        
        .ability-radar-card {
          .radar-container {
            min-height: 300px;
          }
        }
      }
    }
  }
}
</style>
