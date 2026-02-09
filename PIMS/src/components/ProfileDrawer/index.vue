<template>
  <a-drawer
    v-model:open="visible"
    title="个人信息"
    placement="right"
    :width="drawerWidth"
    @close="handleClose"
  >
    <div class="profile-drawer">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <a-avatar :src="formState.avatar" :size="80">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <a-upload
            name="avatar"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleAvatarChange"
          >
            <div class="avatar-edit-btn">
              <CameraOutlined />
            </div>
          </a-upload>
        </div>
        <div class="user-name">{{ userStore.userName }}</div>
        <div class="user-role">
          <a-tag color="blue" v-for="role in userStore.userRoles" :key="role.id">
            {{ role.name }}
          </a-tag>
        </div>
      </div>

      <!-- 基本信息 -->
      <a-divider>基本信息</a-divider>
      <a-form layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="formState.username" disabled />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
        </a-form-item>
      </a-form>

      <!-- 修改密码 -->
      <a-divider>修改密码</a-divider>
      <a-form layout="vertical">
        <a-form-item label="当前密码">
          <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入当前密码" />
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认新密码">
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <a-space>
          <a-button @click="handleClose">取消</a-button>
          <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
        </a-space>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, CameraOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const userStore = useUserStore()
const visible = ref(false)
const saving = ref(false)

// 响应式抽屉宽度 - 至少占屏幕50%，最小600px，最大1200px
const drawerWidth = ref('60vw')

// 表单状态
const formState = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watch(() => props.open, (val) => {
  visible.value = val
  if (val && userStore.currentUser) {
    // 初始化表单数据
    Object.assign(formState, {
      username: userStore.currentUser.username,
      name: userStore.currentUser.name,
      email: userStore.currentUser.email || '',
      phone: userStore.currentUser.phone || '',
      avatar: userStore.currentUser.avatar || ''
    })
    // 清空密码表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }
})

watch(visible, (val) => {
  emit('update:open', val)
})

// 头像上传前检查
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传
const handleAvatarChange = (info: UploadChangeParam<UploadFile>) => {
  const file = info.file.originFileObj as File
  if (file) {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      formState.avatar = reader.result as string
    })
    reader.readAsDataURL(file)
  }
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}

// 保存
const handleSave = async () => {
  // 验证密码
  if (passwordForm.newPassword) {
    if (!passwordForm.oldPassword) {
      message.warning('请输入当前密码')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      message.warning('新密码至少6个字符')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.warning('两次输入的新密码不一致')
      return
    }
  }

  saving.value = true
  try {
    // 更新用户信息
    userStore.updateUser({
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      avatar: formState.avatar
    })
    message.success('个人信息更新成功')
    
    if (passwordForm.newPassword) {
      message.success('密码修改成功')
    }
    
    handleClose()
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="less">
.profile-drawer {
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    
    .avatar-wrapper {
      position: relative;
      
      .avatar-edit-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 28px;
        height: 28px;
        background: #1890ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        border: 2px solid #fff;
        
        &:hover {
          background: #40a9ff;
        }
      }
    }
    
    .user-name {
      margin-top: 12px;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
    
    .user-role {
      margin-top: 8px;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
