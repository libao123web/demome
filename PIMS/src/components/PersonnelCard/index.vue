<template>
  <div class="personnel-card">
    <div class="card-photo">
      <a-avatar v-if="personnel.photo" :src="personnel.photo" :size="80" shape="square" />
      <a-avatar v-else :size="80" shape="square">
        <template #icon><UserOutlined /></template>
      </a-avatar>
    </div>
    <div class="card-name">{{ personnel.name }}</div>
    <div class="card-info">
      <div v-if="personnel.gender" class="info-item">
        {{ personnel.gender === 'male' ? '男' : '女' }}
      </div>
      <div v-if="personnel.phone" class="info-item">
        {{ personnel.phone }}
      </div>
    </div>
    <a-button 
      type="primary" 
      size="small" 
      class="similar-btn"
      @click="handleSimilarClick"
    >
      相似人员
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue'
import type { Personnel } from '@/types'

interface Props {
  personnel: Personnel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  similarClick: [personnel: Personnel]
}>()

const handleSimilarClick = () => {
  emit('similarClick', props.personnel)
}
</script>

<style scoped lang="less">
.personnel-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .card-photo {
    margin-bottom: 12px;
  }
  
  .card-name {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 8px;
  }
  
  .card-info {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 12px;
    
    .info-item {
      margin: 4px 0;
    }
  }
  
  .similar-btn {
    width: 100%;
  }
}
</style>
