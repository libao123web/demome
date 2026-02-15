<template>
  <div class="transfer-personnel">
    <!-- 页面头部：返回按钮 -->
    <div class="page-header mb-4">
      <a-button @click="goBack">
        <LeftOutlined /> 返回人员岗位
      </a-button>
      <span class="page-title">{{ isAddMode ? '添加人员' : '更换人员' }}</span>
    </div>

    <!-- 当前待更换人员提示 -->
    <a-alert
      v-if="currentTransferMember"
      class="mb-4"
      type="info"
      show-icon
    >
      <template #message>
        <div class="flex items-center gap-3">
          <a-avatar :src="currentTransferMember.personnel?.photo || undefined" :size="40" shape="square">
            {{ currentTransferMember.personnel?.name?.charAt(0) }}
          </a-avatar>
          <div>
            <div class="font-medium">当前待更换人员：{{ currentTransferMember.personnel?.name }}</div>
            <div class="text-gray-500 text-sm">请在下方选择替换人员后点击"更换"按钮进行更换</div>
          </div>
        </div>
      </template>
    </a-alert>

    <!-- 添加人员模式提示 -->
    <a-alert
      v-if="isAddMode"
      class="mb-4"
      type="success"
      show-icon
    >
      <template #message>
        <div class="flex items-center gap-3">
          <div>
            <div class="font-medium">添加人员到组织</div>
            <div class="text-gray-500 text-sm">请在下方选择要添加的人员后点击"添加"按钮</div>
          </div>
        </div>
      </template>
    </a-alert>

    <!-- 推荐人员区域 -->
    <a-card class="recommend-card mb-4" :bodyStyle="{ padding: '16px' }">
      <template #title>
        <span class="text-blue-500 font-medium">推荐人员</span>
      </template>
      <a-spin :spinning="recommendLoading">
        <div v-if="recommendedList.length" class="recommend-list">
          <div 
            v-for="person in recommendedList" 
            :key="person.id" 
            class="recommend-card-item"
            :class="{ selected: selectedPersonnel.includes(person.id) }"
            @click="toggleSelectRecommend(person)"
          >
            <div class="match-score">{{ person.matchScore }}%匹配</div>
            <a-avatar :src="person.photo || undefined" :size="80" shape="square" class="person-avatar">
              {{ person.name?.charAt(0) }}
            </a-avatar>
            <div class="person-name">{{ person.name }}</div>
            <div class="ability-tags">
              <a-tag v-if="person.ability?.leadershipAbility" color="blue">
                领导能力 {{ person.ability.leadershipAbility }}
              </a-tag>
              <a-tag v-if="person.ability?.teamworkAbility" color="cyan">
                团队合作 {{ person.ability.teamworkAbility }}
              </a-tag>
              <a-tag v-if="person.ability?.communicationAbility" color="green">
                沟通能力 {{ person.ability.communicationAbility }}
              </a-tag>
              <a-tag v-if="person.ability?.managementAbility" color="orange">
                管理技巧 {{ person.ability.managementAbility }}
              </a-tag>
            </div>
          </div>
        </div>
        <a-empty v-else description="暂无推荐人员" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </a-spin>
    </a-card>

    <!-- 人员列表区域 -->
    <a-card class="member-list-card" :bodyStyle="{ padding: '16px' }">
      <template #title>
        <span class="text-blue-500 font-medium">人员列表</span>
      </template>

      <!-- 搜索栏 -->
      <a-form layout="inline" class="search-form mb-4">
        <a-form-item label="姓名">
          <a-input v-model:value="searchParams.name" placeholder="请输入关键字" allowClear style="width: 160px" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="searchParams.phone" placeholder="请输入" allowClear style="width: 160px" />
        </a-form-item>
        <a-form-item label="标签">
          <a-select v-model:value="searchParams.tagId" placeholder="请选择" allowClear style="width: 140px">
            <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 人员列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredMembers"
        :loading="membersLoading"
        :pagination="pagination"
        :row-selection="rowSelection"
        rowKey="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.personnel?.photo || undefined" :size="36" shape="square">
              {{ record.personnel?.name?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-if="column.key === 'name'">
            {{ record.personnel?.name }}
          </template>
          <template v-if="column.key === 'gender'">
            {{ record.personnel?.gender === 'male' ? '男' : '女' }}
          </template>
          <template v-if="column.key === 'category'">
            {{ getCategoryName(record.personnel?.categoryId) }}
          </template>
          <template v-if="column.key === 'tags'">
            <template v-if="record.personnel?.tags?.length">
              <a-tag v-for="tag in record.personnel.tags.slice(0, 2)" :key="tag.id" :color="tag.color">
                {{ tag.name }}
              </a-tag>
            </template>
            <span v-else>-</span>
          </template>
          <template v-if="column.key === 'phone'">
            {{ maskPhone(record.personnel?.phone) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="viewDetail(record)">查看</a-button>
          </template>
        </template>
      </a-table>

      <!-- 底部操作区 -->
      <div class="footer-actions">
        <a-space>
          <a-button 
            type="primary" 
            :disabled="!canTransfer" 
            @click="handleReplacementTransfer"
          >
            {{ isAddMode ? '确认添加' : (currentTransferMember ? '确认更换' : '更换') }}
          </a-button>
          <a-button @click="handleCancel">{{ (currentTransferMember || isAddMode) ? '返回' : '取消' }}</a-button>
        </a-space>
      </div>
    </a-card>

    <!-- 选择目标组织弹窗（非替换模式时使用） -->
    <a-modal
      v-model:open="transferVisible"
      title="选择目标组织"
      :confirmLoading="transferLoading"
      @ok="handleTransfer"
      @cancel="transferVisible = false"
    >
      <a-alert 
        :message="`已选择 ${totalSelected} 人，将更换到目标组织`" 
        type="info" 
        show-icon 
        class="mb-4"
      />
      <a-alert 
        v-if="targetOrgId && getTargetOrgPositionTag()"
        :message="`目标组织岗位标签：${getTargetOrgPositionTag()}`" 
        type="success" 
        show-icon 
        class="mb-4"
      />
      <a-form layout="vertical">
        <a-form-item label="目标组织" required>
          <a-tree-select
            v-model:value="targetOrgId"
            :tree-data="treeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择目标组织"
            tree-default-expand-all
            style="width: 100%"
          >
            <template #title="{ name, positionTagId }">
              <span>
                {{ name }}
                <a-tag v-if="getPositionTagName(positionTagId)" color="blue" size="small" class="ml-2">
                  {{ getPositionTagName(positionTagId) }}
                </a-tag>
              </span>
            </template>
          </a-tree-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 人员详情抽屉 -->
    <PersonnelDetailDrawer
      v-model:open="detailVisible"
      :personnel="currentPersonnel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Empty } from 'ant-design-vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { organizationApi, tagApi, categoryApi, positionTagApi } from '@/api'
import type { Organization, OrganizationMember, Tag, Category, Personnel, PositionTag } from '@/types'
import PersonnelDetailDrawer from '@/components/PersonnelDetailDrawer/index.vue'

const route = useRoute()
const router = useRouter()

// 从其他页面跳转过来的当前成员信息
const currentTransferMember = ref<OrganizationMember | null>(null)
const currentSourceOrgId = ref<string>('')
// 添加模式标记(从Members页面点击"添加人员"进入)
const isAddMode = ref(false)

// 推荐人员
const recommendedList = ref<(Personnel & { matchScore: number })[]>([])
const recommendLoading = ref(false)
const selectedPersonnel = ref<string[]>([])

// 岗位标签
const positionTags = ref<PositionTag[]>([])

// 获取岗位标签名称
const getPositionTagName = (tagId?: string) => {
  if (!tagId) return ''
  return positionTags.value.find(t => t.id === tagId)?.name || ''
}

// 组织树
const treeData = ref<Organization[]>([])

// 人员列表
const members = ref<OrganizationMember[]>([])
const membersLoading = ref(false)
const tags = ref<Tag[]>([])
const categories = ref<Category[]>([])

const searchParams = ref({
  name: '',
  phone: '',
  tagId: undefined as string | undefined
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格选择
const selectedRowKeys = ref<string[]>([])
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
    // 替换模式下，选择表格人员时清空推荐人员选择
    if (currentTransferMember.value && keys.length > 0) {
      selectedPersonnel.value = []
    }
  },
  // 替换模式下只允许选择一个
  type: currentTransferMember.value ? 'radio' : 'checkbox'
}))

// 总选中数
const totalSelected = computed(() => {
  return selectedRowKeys.value.length + selectedPersonnel.value.length
})

// 是否可以更换/添加
const canTransfer = computed(() => {
  if (currentTransferMember.value) {
    // 替换模式：需要选择一个替换人员
    return selectedRowKeys.value.length === 1 || selectedPersonnel.value.length === 1
  }
  if (isAddMode.value) {
    // 添加模式：需要至少选择一个人员
    return selectedRowKeys.value.length > 0 || selectedPersonnel.value.length > 0
  }
  // 批量模式
  return selectedRowKeys.value.length > 0 || selectedPersonnel.value.length > 0
})

// 更换组织
const transferVisible = ref(false)
const transferLoading = ref(false)
const targetOrgId = ref<string>('')

// 人员详情抽屉
const detailVisible = ref(false)
const currentPersonnel = ref<Personnel | null>(null)

// 表格列
const columns = [
  { title: '', key: 'checkbox', width: 50 },
  { title: '头像', key: 'avatar', width: 80 },
  { title: '姓名', key: 'name', width: 100 },
  { title: '性别', key: 'gender', width: 80 },
  { title: '分类', key: 'category', width: 120 },
  { title: '手机号', key: 'phone', width: 140 },
  { title: '标签', key: 'tags', width: 200 },
  { title: '创建时间', dataIndex: ['personnel', 'createTime'], key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 100 }
]

// 过滤后的人员
const filteredMembers = computed(() => {
  let result = [...members.value]
  
  if (searchParams.value.name) {
    result = result.filter(m => m.personnel?.name?.includes(searchParams.value.name))
  }
  if (searchParams.value.phone) {
    result = result.filter(m => m.personnel?.phone?.includes(searchParams.value.phone))
  }
  if (searchParams.value.tagId) {
    result = result.filter(m => m.personnel?.tags?.some(t => t.id === searchParams.value.tagId))
  }
  
  pagination.value.total = result.length
  return result
})

// 加载组织树
const loadTree = async () => {
  try {
    const res = await organizationApi.getTree()
    treeData.value = res || []
  } catch (e) {
    console.error(e)
  }
}

// 加载推荐人员
const loadRecommended = async () => {
  recommendLoading.value = true
  try {
    const res = await organizationApi.getRecommendedPersonnel('all')
    recommendedList.value = res || []
  } catch (e) {
    console.error(e)
  } finally {
    recommendLoading.value = false
  }
}

// 加载所有人员
const loadMembers = async () => {
  membersLoading.value = true
  try {
    const res = await organizationApi.getMembers('all')
    members.value = res || []
  } catch (e) {
    console.error(e)
  } finally {
    membersLoading.value = false
  }
}

// 加载标签
const loadTags = async () => {
  try {
    const res = await tagApi.getList()
    tags.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const res = await categoryApi.getList()
    categories.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 加载岗位标签
const loadPositionTags = async () => {
  try {
    const res = await positionTagApi.getList()
    positionTags.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 根据 URL 参数加载待更换的成员信息
const loadTransferMemberFromQuery = async () => {
  const { memberId, orgId, mode } = route.query
  
  // 添加模式：从Members页面点击"添加人员"进入
  if (mode === 'add' && orgId) {
    isAddMode.value = true
    currentSourceOrgId.value = orgId as string
    message.info('请选择要添加到组织的人员')
    return
  }
  
  // 更换模式：从Members页面点击"更换人员"进入
  if (memberId && orgId) {
    currentSourceOrgId.value = orgId as string
    try {
      // 从指定组织获取成员列表，找到对应成员
      const members = await organizationApi.getMembers(orgId as string)
      const member = members?.find((m: OrganizationMember) => m.id === memberId)
      if (member) {
        currentTransferMember.value = member
        message.info(`请为 ${member.personnel?.name || '该成员'} 选择替换人员后进行更换`)
      }
    } catch (e) {
      console.error('加载待更换成员信息失败', e)
    }
  }
}

onMounted(() => {
  loadTree()
  loadRecommended()
  loadMembers()
  loadTags()
  loadCategories()
  loadPositionTags()
  loadTransferMemberFromQuery()
})

// 获取分类名称
const getCategoryName = (id?: string) => {
  if (!id) return '-'
  return categories.value.find(c => c.id === id)?.name || '-'
}

// 手机号脱敏
const maskPhone = (phone?: string) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 切换推荐人员选中
const toggleSelectRecommend = (person: Personnel) => {
  if (currentTransferMember.value) {
    // 替换模式：单选，清空其他选择
    if (selectedPersonnel.value.includes(person.id)) {
      selectedPersonnel.value = []
    } else {
      selectedPersonnel.value = [person.id]
      selectedRowKeys.value = [] // 清空表格选择
    }
  } else {
    // 批量模式：多选
    const index = selectedPersonnel.value.indexOf(person.id)
    if (index > -1) {
      selectedPersonnel.value.splice(index, 1)
    } else {
      selectedPersonnel.value.push(person.id)
    }
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
}

// 重置
const handleReset = () => {
  searchParams.value = { name: '', phone: '', tagId: undefined }
  pagination.value.current = 1
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

// 查看详情
const viewDetail = (record: OrganizationMember) => {
  currentPersonnel.value = record.personnel || null
  detailVisible.value = true
}

// 获取目标组织的岗位标签
const getTargetOrgPositionTag = () => {
  if (!targetOrgId.value) return ''
  
  const findOrg = (orgs: Organization[]): Organization | undefined => {
    for (const org of orgs) {
      if (org.id === targetOrgId.value) return org
      if (org.children) {
        const found = findOrg(org.children)
        if (found) return found
      }
    }
    return undefined
  }
  
  const org = findOrg(treeData.value)
  return org?.positionTagId ? getPositionTagName(org.positionTagId) : ''
}

// 返回人员岗位页面（带上原组织ID）
const goBack = () => {
  if (currentSourceOrgId.value) {
    router.push({ path: '/position/members', query: { orgId: currentSourceOrgId.value } })
  } else {
    router.push('/position/members')
  }
}

// 取消/返回
const handleCancel = () => {
  if (currentTransferMember.value || isAddMode.value) {
    // 替换模式或添加模式，返回人员岗位页面（带上原组织ID）
    if (currentSourceOrgId.value) {
      router.push({ path: '/position/members', query: { orgId: currentSourceOrgId.value } })
    } else {
      router.push('/position/members')
    }
  } else {
    // 普通模式，清空选择
    selectedRowKeys.value = []
    selectedPersonnel.value = []
  }
}

// 替换更换 - 用选中的人员替换当前待更换人员
const handleReplacementTransfer = async () => {
  if (!canTransfer.value) return
  
  // 添加模式：将选中的人员添加到目标组织
  if (isAddMode.value && currentSourceOrgId.value) {
    let personnelIdsToAdd: string[] = []
    
    // 获取选中的人员ID
    if (selectedRowKeys.value.length > 0) {
      personnelIdsToAdd = selectedRowKeys.value.map(id => {
        const member = members.value.find(m => m.id === id)
        return member?.personnelId || ''
      }).filter(Boolean)
    }
    
    if (selectedPersonnel.value.length > 0) {
      personnelIdsToAdd = [...personnelIdsToAdd, ...selectedPersonnel.value]
    }
    
    if (personnelIdsToAdd.length === 0) {
      message.warning('请选择要添加的人员')
      return
    }
    
    transferLoading.value = true
    try {
      // 将人员添加到目标组织
      for (const personnelId of personnelIdsToAdd) {
        // 检查该人员是否已在目标组织中
        const existingMember = members.value.find(
          m => m.personnelId === personnelId && m.organizationId === currentSourceOrgId.value
        )
        if (existingMember) {
          continue // 跳过已存在的人员
        }
        
        await organizationApi.addMember({
          organizationId: currentSourceOrgId.value,
          personnelId: personnelId
        })
      }
      
      message.success(`成功添加 ${personnelIdsToAdd.length} 名人员到组织`)
      router.push({ path: '/position/members', query: { orgId: currentSourceOrgId.value } })
    } catch (e) {
      message.error('添加失败')
    } finally {
      transferLoading.value = false
    }
    return
  }
  
  if (currentTransferMember.value) {
    // 替换模式：将选中的人员替换到当前成员的组织，原人员退出成为自由人
    let newMemberId = selectedRowKeys.value[0]
    
    // 如果是从推荐人员中选择的，需要通过 personnelId 找到对应的成员记录
    if (!newMemberId && selectedPersonnel.value.length > 0) {
      const selectedPersonnelId = selectedPersonnel.value[0]
      const member = members.value.find(m => m.personnelId === selectedPersonnelId)
      newMemberId = member?.id
    }
    
    if (!newMemberId) {
      message.warning('请选择替换人员')
      return
    }
    
    transferLoading.value = true
    try {
      // 1. 先将原人员从组织中移除（成为自由人）
      await organizationApi.removeMember(currentTransferMember.value.id)
      
      // 2. 将选中的人员调入当前成员的组织
      await organizationApi.transferMember({
        memberId: newMemberId,
        targetOrganizationId: currentSourceOrgId.value
      })
      
      message.success('更换成功，原人员已退出组织')
      // 返回人员岗位页面（带上原组织ID）
      router.push({ path: '/position/members', query: { orgId: currentSourceOrgId.value } })
    } catch (e) {
      message.error('更换失败')
    } finally {
      transferLoading.value = false
    }
  } else {
    // 非替换模式：打开选择目标组织弹窗
    openTransferModal()
  }
}

// 打开更换弹窗
const openTransferModal = () => {
  targetOrgId.value = ''
  transferVisible.value = true
}

// 确认更换（批量模式）
const handleTransfer = async () => {
  if (!targetOrgId.value) {
    message.warning('请选择目标组织')
    return
  }
  
  transferLoading.value = true
  try {
    // 获取所有要更换的成员ID
    const memberIds = [...selectedRowKeys.value]
    
    // 推荐人员需要先找到对应的成员记录
    if (selectedPersonnel.value.length) {
      const recommendMemberIds = members.value
        .filter(m => selectedPersonnel.value.includes(m.personnelId))
        .map(m => m.id)
      memberIds.push(...recommendMemberIds)
    }
    
    await organizationApi.batchTransferMembers({
      memberIds: [...new Set(memberIds)],
      targetOrganizationId: targetOrgId.value
    })
    
    message.success('批量更换成功')
    transferVisible.value = false
    selectedRowKeys.value = []
    selectedPersonnel.value = []
    loadMembers()
  } catch (e) {
    message.error('更换失败')
  } finally {
    transferLoading.value = false
  }
}
</script>

<style scoped lang="less">
.transfer-personnel {
  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    
    .page-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .recommend-card {
    .recommend-list {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
      
      @media (max-width: 768px) {
        gap: 12px;
      }
      
      .recommend-card-item {
        flex-shrink: 0;
        width: 160px;
        border: 2px solid #e8e8e8;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        
        @media (max-width: 768px) {
          width: 140px;
          padding: 10px;
        }
        
        &:hover {
          border-color: #1890ff;
        }
        
        &.selected {
          border-color: #1890ff;
          background: #e6f7ff;
        }
        
        .match-score {
          position: absolute;
          top: 0px;
          right: 3px;
          color: #70B603;
          font-weight: bold;
          font-size: 12px;
          z-index: 10;
        }
        
        .person-avatar {
          background: linear-gradient(135deg, #1890ff, #096dd9);
        }
        
        .person-name {
          margin: 8px 0;
          font-size: 16px;
          font-weight: 500;
          
          @media (max-width: 768px) {
            font-size: 14px;
          }
        }
        
        .ability-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
          
          :deep(.ant-tag) {
            margin: 0;
            font-size: 10px;
            padding: 0 4px;
          }
        }
      }
    }
  }
  
  .member-list-card {
    .search-form {
      flex-wrap: wrap;
      gap: 8px;
      
      @media (max-width: 768px) {
        :deep(.ant-form-item) {
          margin-bottom: 8px;
        }
      }
    }
    
    .footer-actions {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      text-align: center;
    }
  }
}
</style>
