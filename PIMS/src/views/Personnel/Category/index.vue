<template>
  <div class="personnel-category">
    <!-- 分类树形结构 -->
    <a-row :gutter="16">
      <!-- 左侧树 -->
      <a-col :xs="24" :md="8">
        <a-card title="分类结构" class="tree-card">
          <template #extra>
            <a-button type="primary" size="small" @click="showAddRootModal">
              <PlusOutlined />
              新增
            </a-button>
          </template>
          
          <a-spin :spinning="loading">
            <a-tree
              v-if="treeData.length > 0"
              v-model:selectedKeys="selectedKeys"
              v-model:expandedKeys="expandedKeys"
              :tree-data="treeData"
              :field-names="{ title: 'name', key: 'id' }"
              @select="handleSelect"
              block-node
              show-icon
            >
              <template #icon>
                <FolderOutlined />
              </template>
              <template #title="{ name, id }">
                <div class="tree-node">
                  <span>{{ name }}</span>
                  <a-dropdown :trigger="['click']" @click.stop>
                    <MoreOutlined class="more-icon" />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="showAddChildModal(id)">
                          <PlusOutlined /> 添加子分类
                        </a-menu-item>
                        <a-menu-item @click="handleEdit(id)">
                          <EditOutlined /> 编辑
                        </a-menu-item>
                        <a-menu-item danger @click="handleDeleteConfirm(id)">
                          <DeleteOutlined /> 删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </template>
            </a-tree>
            <a-empty v-else description="暂无分类" />
          </a-spin>
        </a-card>
      </a-col>
      
      <!-- 右侧详情 -->
      <a-col :xs="24" :md="16">
        <a-card title="分类详情" class="detail-card">
          <template v-if="selectedCategory">
            <a-descriptions :column="{ xs: 1, sm: 2 }" bordered>
              <a-descriptions-item label="分类名称">{{ selectedCategory.name }}</a-descriptions-item>
              <a-descriptions-item label="分类编码">{{ selectedCategory.code || '-' }}</a-descriptions-item>
              <a-descriptions-item label="上级分类">{{ getParentName(selectedCategory.parentId) }}</a-descriptions-item>
              <a-descriptions-item label="排序">{{ selectedCategory.sort || 0 }}</a-descriptions-item>
              <a-descriptions-item label="人员数量">{{ selectedCategory.count || 0 }} 人</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ selectedCategory.createTime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="描述" :span="2">{{ selectedCategory.description || '-' }}</a-descriptions-item>
            </a-descriptions>
            
            <div class="detail-actions">
              <a-space>
                <a-button type="primary" @click="showEditModal(selectedCategory)">
                  <EditOutlined />
                  编辑
                </a-button>
                <a-button @click="showAddChildModal(selectedCategory.id)">
                  <PlusOutlined />
                  添加子分类
                </a-button>
                <a-popconfirm
                  title="确定要删除此分类吗？"
                  @confirm="handleDelete(selectedCategory.id)"
                >
                  <a-button danger>
                    <DeleteOutlined />
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>
          </template>
          <a-empty v-else description="请选择左侧分类查看详情" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitLoading"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入分类名称" />
        </a-form-item>
        
        <a-form-item label="分类编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入分类编码（可选）" />
        </a-form-item>
        
        <a-form-item label="上级分类" name="parentId">
          <a-tree-select
            v-model:value="formState.parentId"
            :tree-data="treeDataForSelect"
            :field-names="{ label: 'name', value: 'id' }"
            placeholder="请选择上级分类（不选则为顶级分类）"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formState.sort" :min="0" placeholder="排序号" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formState.description" 
            :rows="3" 
            placeholder="请输入分类描述" 
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import { categoryApi } from '@/api'
import type { Category } from '@/types'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const categories = ref<Category[]>([])
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 弹窗状态
const modalVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<Category | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const formState = reactive<Partial<Category>>({
  name: '',
  code: '',
  parentId: undefined,
  sort: 0,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入分类名称' }]
}

const modalTitle = computed(() => isEdit.value ? '编辑分类' : '新增分类')

// 选中的分类
const selectedCategory = computed(() => {
  if (selectedKeys.value.length === 0) return null
  return findCategory(categories.value, selectedKeys.value[0])
})

// 树形数据
const treeData = computed(() => {
  return buildTree(categories.value)
})

// 树形选择数据
const treeDataForSelect = computed(() => {
  return treeData.value
})

// 构建树形结构
const buildTree = (list: Category[], parentId?: string): Category[] => {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

// 查找分类
const findCategory = (list: Category[], id: string): Category | null => {
  for (const item of list) {
    if (item.id === id) return item
    if (item.children) {
      const found = findCategory(item.children, id)
      if (found) return found
    }
  }
  // 在扁平列表中查找
  return categories.value.find(c => c.id === id) || null
}

// 获取上级分类名称
const getParentName = (parentId?: string): string => {
  if (!parentId) return '顶级分类'
  const parent = categories.value.find(c => c.id === parentId)
  return parent?.name || '-'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await categoryApi.getList()
    categories.value = res.data
    // 默认展开所有
    expandedKeys.value = categories.value.map(c => c.id)
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 选择节点
const handleSelect = (keys: string[]) => {
  selectedKeys.value = keys
}

// 显示新增顶级分类弹窗
const showAddRootModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 显示新增子分类弹窗
const showAddChildModal = (parentId: string) => {
  isEdit.value = false
  resetForm()
  formState.parentId = parentId
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: Category) => {
  isEdit.value = true
  Object.assign(formState, record)
  currentRecord.value = record
  modalVisible.value = true
}

// 编辑（从树节点菜单）
const handleEdit = (id: string) => {
  const record = findCategory(categories.value, id)
  if (record) {
    showEditModal(record)
  }
}

// 删除确认（从树节点菜单）
const handleDeleteConfirm = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除此分类吗？',
    onOk: () => handleDelete(id)
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    name: '',
    code: '',
    parentId: undefined,
    sort: 0,
    description: ''
  })
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      await categoryApi.update(currentRecord.value!.id, formState as Category)
      message.success('更新成功')
    } else {
      await categoryApi.create(formState as Category)
      message.success('新增成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error: any) {
    if (error.errorFields) {
      return
    }
    message.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 删除
const handleDelete = async (id: string) => {
  try {
    // 检查是否有子分类
    const hasChildren = categories.value.some(c => c.parentId === id)
    if (hasChildren) {
      message.warning('请先删除子分类')
      return
    }
    
    await categoryApi.delete(id)
    message.success('删除成功')
    selectedKeys.value = []
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.personnel-category {
  .tree-card {
    min-height: 500px;
    
    .tree-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      
      .more-icon {
        padding: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        
        &:hover {
          background: #f0f0f0;
          border-radius: 4px;
        }
      }
    }
    
    :deep(.ant-tree-node-content-wrapper:hover) {
      .more-icon {
        opacity: 1;
      }
    }
  }
  
  .detail-card {
    min-height: 500px;
    
    .detail-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
  
  @media (max-width: 768px) {
    .tree-card,
    .detail-card {
      margin-bottom: 16px;
      min-height: auto;
    }
  }
}
</style>
