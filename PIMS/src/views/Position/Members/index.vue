<template>
  <div class="personnel-position">
    <a-row :gutter="16">
      <!-- 左侧：组织树 -->
      <a-col :xs="24" :sm="24" :md="6" :lg="5">
        <a-card class="org-tree-card" :bodyStyle="{ padding: '12px' }">
          <a-input-search 
            v-model:value="searchKeyword" 
            placeholder="请输入" 
            class="mb-3"
          />
          <a-spin :spinning="treeLoading">
            <div class="org-tree-wrapper">
              <a-tree
                v-if="filteredTreeData.length"
                v-model:selectedKeys="selectedKeys"
                :tree-data="filteredTreeData"
                :field-names="{ title: 'name', key: 'id', children: 'children' }"
                default-expand-all
                @select="handleOrgSelect"
              >
                <template #title="{ name, memberCount, positionTagId, dataRef }">
                  <span>
                    {{ name }} 
                    <span class="text-gray-400">({{ memberCount || 0 }})</span>
                    <a-tag v-if="getPositionTagName(positionTagId)" color="blue" size="small" class="ml-2">
                      {{ getPositionTagName(positionTagId) }}
                    </a-tag>
                  </span>
                </template>
              </a-tree>
              <a-empty v-else description="暂无组织" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </div>
          </a-spin>
        </a-card>
      </a-col>

      <!-- 右侧：人员卡片 -->
      <a-col :xs="24" :sm="24" :md="18" :lg="19">
        <a-card :bodyStyle="{ padding: '16px' }">
          <!-- 搜索栏 -->
          <a-form layout="inline" class="search-form mb-4">
            <a-form-item label="姓名">
              <a-input v-model:value="searchParams.name" placeholder="请输入关键字" allowClear style="width: 140px" />
            </a-form-item>
            <a-form-item label="手机号">
              <a-input v-model:value="searchParams.phone" placeholder="请输入" allowClear style="width: 140px" />
            </a-form-item>
            <a-form-item label="标签">
              <a-select v-model:value="searchParams.tagId" placeholder="请选择" allowClear style="width: 120px">
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

          <!-- 人员卡片列表 -->
          <a-spin :spinning="membersLoading">
            <div v-if="filteredMembers.length" class="member-cards">
              <div 
                v-for="member in filteredMembers" 
                :key="member.id" 
                class="member-card"
                @click="openPersonnelDetail(member)"
              >
                <div class="position-tag">{{ getCurrentOrgPositionTag() }}</div>
                <div class="card-content">
                  <a-avatar 
                    :src="member.personnel?.photo" 
                    :size="64"
                    shape="square"
                    class="member-avatar"
                  >
                    {{ member.personnel?.name?.charAt(0) }}
                  </a-avatar>
                  <div class="member-name">{{ member.personnel?.name }}</div>
                </div>
                <a-button type="primary" size="small" ghost @click.stop="openTransfer(member)">
                  更换人员
                </a-button>
              </div>
            </div>
            <a-empty v-else description="暂无人员" />
          </a-spin>

          <!-- 分页 -->
          <div v-if="filteredMembers.length" class="pagination-wrapper">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              show-size-changer
              @change="handlePageChange"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 更换组织弹窗 -->
    <a-modal
      v-model:open="transferVisible"
      title="更换组织"
      :confirmLoading="transferLoading"
      @ok="handleTransfer"
      @cancel="transferVisible = false"
    >
      <a-alert 
        :message="`将 ${currentMember?.personnel?.name} 从当前组织更换到其他组织`" 
        type="info" 
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
          />
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
import { ref, computed, onMounted } from 'vue'
import { message, Empty } from 'ant-design-vue'
import { organizationApi, tagApi, positionTagApi } from '@/api'
import type { Organization, OrganizationMember, Tag, Personnel, PositionTag } from '@/types'
import PersonnelDetailDrawer from '@/components/PersonnelDetailDrawer/index.vue'

// 组织树
const treeData = ref<Organization[]>([])
const treeLoading = ref(false)
const searchKeyword = ref('')
const selectedKeys = ref<string[]>([])

// 岗位标签
const positionTags = ref<PositionTag[]>([])

// 当前选中的组织
const currentOrg = ref<Organization | null>(null)

// 获取当前组织的岗位标签名称
const getCurrentOrgPositionTag = () => {
  if (!currentOrg.value?.positionTagId) return '员工'
  return getPositionTagName(currentOrg.value.positionTagId) || '员工'
}

// 获取岗位标签名称
const getPositionTagName = (tagId?: string) => {
  if (!tagId) return ''
  return positionTags.value.find(t => t.id === tagId)?.name || ''
}

// 过滤组织树
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) return treeData.value
  
  const filterTree = (nodes: Organization[]): Organization[] => {
    return nodes.reduce((acc: Organization[], node) => {
      const children = node.children ? filterTree(node.children) : []
      if (node.name.includes(searchKeyword.value) || children.length) {
        acc.push({ ...node, children: children.length ? children : node.children })
      }
      return acc
    }, [])
  }
  
  return filterTree(treeData.value)
})

// 人员列表
const members = ref<OrganizationMember[]>([])
const membersLoading = ref(false)
const tags = ref<Tag[]>([])

const searchParams = ref({
  name: '',
  phone: '',
  tagId: undefined as string | undefined
})

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

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
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  return result.slice(start, start + pagination.value.pageSize)
})

// 更换组织
const transferVisible = ref(false)
const transferLoading = ref(false)
const currentMember = ref<OrganizationMember | null>(null)
const targetOrgId = ref<string>('')

// 人员详情
const detailVisible = ref(false)
const currentPersonnel = ref<Personnel | null>(null)

const openPersonnelDetail = (member: OrganizationMember) => {
  currentPersonnel.value = member.personnel || null
  detailVisible.value = true
}

// 加载组织树
const loadTree = async () => {
  treeLoading.value = true
  try {
    const res = await organizationApi.getTree()
    treeData.value = res || []
    // 默认选中第一个
    if (res?.length) {
      const firstChild = res[0].children?.[0]
      if (firstChild) {
        selectedKeys.value = [firstChild.id]
        currentOrg.value = firstChild
        loadMembers(firstChild.id)
      } else {
        selectedKeys.value = [res[0].id]
        currentOrg.value = res[0]
        loadMembers(res[0].id)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    treeLoading.value = false
  }
}

// 加载人员
const loadMembers = async (orgId: string) => {
  membersLoading.value = true
  try {
    const res = await organizationApi.getMembers(orgId)
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

// 加载岗位标签
const loadPositionTags = async () => {
  try {
    const res = await positionTagApi.getList()
    positionTags.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadTree()
  loadTags()
  loadPositionTags()
})

// 选择组织
const handleOrgSelect = (keys: string[]) => {
  if (keys.length) {
    // 查找当前选中的组织
    const findOrg = (orgs: Organization[], id: string): Organization | null => {
      for (const org of orgs) {
        if (org.id === id) return org
        if (org.children) {
          const found = findOrg(org.children, id)
          if (found) return found
        }
      }
      return null
    }
    currentOrg.value = findOrg(treeData.value, keys[0])
    loadMembers(keys[0])
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

// 分页
const handlePageChange = (page: number) => {
  pagination.value.current = page
}

// 打开更换弹窗
const openTransfer = (member: OrganizationMember) => {
  currentMember.value = member
  targetOrgId.value = ''
  transferVisible.value = true
}

// 确认更换
const handleTransfer = async () => {
  if (!targetOrgId.value) {
    message.warning('请选择目标组织')
    return
  }
  
  transferLoading.value = true
  try {
    await organizationApi.transferMember({
      memberId: currentMember.value!.id,
      targetOrganizationId: targetOrgId.value
    })
    message.success('更换成功')
    transferVisible.value = false
    // 刷新当前组织人员
    if (selectedKeys.value.length) {
      loadMembers(selectedKeys.value[0])
    }
  } catch (e) {
    message.error('更换失败')
  } finally {
    transferLoading.value = false
  }
}
</script>

<style scoped lang="less">
.personnel-position {
  .org-tree-card {
    height: calc(100vh - 180px);
    overflow: hidden;
    
    .org-tree-wrapper {
      height: calc(100vh - 280px);
      overflow-y: auto;
    }
  }
  
  .search-form {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .member-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    
    .member-card {
      position: relative;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #1890ff;
      }
      
      .position-tag {
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(135deg, #1890ff, #096dd9);
        color: #fff;
        padding: 2px 12px;
        font-size: 12px;
        border-radius: 8px 0 8px 0;
      }
      
      .card-content {
        padding: 16px 0;
        
        .member-avatar {
          background: linear-gradient(135deg, #1890ff, #096dd9);
        }
        
        .member-name {
          margin-top: 8px;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
  }
  
  .pagination-wrapper {
    margin-top: 16px;
    text-align: right;
  }
}
</style>
