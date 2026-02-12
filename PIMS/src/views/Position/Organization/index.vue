<template>
  <div class="organization-manage">
    <a-card title="组织架构管理">
      <template #extra>
        <a-button type="primary" @click="openCreate(null)">
          <PlusOutlined /> 新增顶级组织
        </a-button>
      </template>

      <a-spin :spinning="loading">
        <div v-if="treeData.length" class="org-tree-container">
          <a-tree
            :tree-data="treeData"
            :field-names="{ title: 'name', key: 'id', children: 'children' }"
            default-expand-all
            block-node
          >
            <template #title="{ name, id, memberCount, positionTagId, dataRef }">
              <div class="tree-node">
                <span class="node-title">
                  <FolderOutlined class="mr-2" />
                  {{ name }}
                  <span class="member-count">({{ memberCount || 0 }})</span>
                  <a-tag v-if="getPositionTagName(positionTagId)" color="blue" size="small" class="ml-2">
                    {{ getPositionTagName(positionTagId) }}
                  </a-tag>
                </span>
                <span class="node-actions">
                  <a-button type="link" size="small" @click.stop="openCreate(dataRef)">
                    <PlusOutlined /> 新增子级
                  </a-button>
                  <a-button type="link" size="small" @click.stop="openEdit(dataRef)">
                    <EditOutlined /> 编辑
                  </a-button>
                  <a-popconfirm 
                    title="确定删除该组织吗？删除后子组织也会被删除" 
                    @confirm="handleDelete(id)"
                  >
                    <a-button type="link" size="small" danger @click.stop>
                      <DeleteOutlined /> 删除
                    </a-button>
                  </a-popconfirm>
                </span>
              </div>
            </template>
          </a-tree>
        </div>
        <a-empty v-else description="暂无组织架构数据" />
      </a-spin>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="visible"
      :title="isEdit ? '编辑组织' : (parentOrg ? `新增子组织 - ${parentOrg.name}` : '新增顶级组织')"
      :confirmLoading="submitLoading"
      @ok="handleSubmit"
      @cancel="visible = false"
    >
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item label="组织名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入组织名称" />
        </a-form-item>
        <a-form-item label="组织编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入组织编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formState.sort" :min="1" placeholder="排序号" class="w-full" />
        </a-form-item>
        <a-form-item label="岗位标签" name="positionTagId">
          <a-select v-model:value="formState.positionTagId" placeholder="请选择岗位标签" allowClear>
            <a-select-option v-for="tag in positionTags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </a-select-option>
          </a-select>
          <div class="text-gray-500 text-xs mt-1">设置后，该组织下的所有人员将自动使用此岗位标签</div>
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons-vue'
import { organizationApi, positionTagApi } from '@/api'
import type { Organization, PositionTag } from '@/types'

// 树数据
const treeData = ref<Organization[]>([])
const loading = ref(false)

// 弹窗状态
const visible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const parentOrg = ref<Organization | null>(null)
const currentId = ref('')

const formState = ref({
  name: '',
  code: '',
  sort: 1,
  positionTagId: undefined as string | undefined,
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入组织名称' }]
}

// 岗位标签列表
const positionTags = ref<PositionTag[]>([])

// 加载岗位标签
const loadPositionTags = async () => {
  try {
    const res = await positionTagApi.getList()
    positionTags.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

// 获取岗位标签名称
const getPositionTagName = (tagId?: string) => {
  if (!tagId) return ''
  return positionTags.value.find(t => t.id === tagId)?.name || ''
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await organizationApi.getTree()
    treeData.value = res || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  loadPositionTags()
})

// 打开新增
const openCreate = (parent: Organization | null) => {
  isEdit.value = false
  parentOrg.value = parent
  currentId.value = ''
  formState.value = { name: '', code: '', sort: 1, positionTagId: undefined, description: '' }
  visible.value = true
  // 清除验证错误
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 打开编辑
const openEdit = (record: Organization) => {
  isEdit.value = true
  parentOrg.value = null
  currentId.value = record.id
  formState.value = {
    name: record.name,
    code: record.code || '',
    sort: record.sort || 1,
    positionTagId: record.positionTagId,
    description: record.description || ''
  }
  visible.value = true
  // 清除验证错误
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await organizationApi.update(currentId.value, formState.value)
      message.success('更新成功')
    } else {
      await organizationApi.create({
        ...formState.value,
        parentId: parentOrg.value?.id || ''
      })
      message.success('创建成功')
    }
    
    visible.value = false
    loadData()
  } catch (e: any) {
    if (!e.errorFields) {
      message.error('操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await organizationApi.delete(id)
    message.success('删除成功')
    loadData()
  } catch (e) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="less">
.organization-manage {
  .org-tree-container {
    min-height: 400px;
    
    :deep(.ant-tree) {
      .ant-tree-treenode {
        width: 100%;
        padding: 4px 0;
        
        .ant-tree-node-content-wrapper {
          flex: 1;
        }
      }
    }
    
    .tree-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-right: 8px;
      
      .node-title {
        display: flex;
        align-items: center;
        
        .member-count {
          color: #999;
          font-size: 12px;
          margin-left: 8px;
        }
      }
      
      .node-actions {
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      &:hover .node-actions {
        opacity: 1;
      }
    }
  }
}
</style>
