<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo -->
      <div class="login-header">
        <img src="@/assets/images/logo.svg" alt="Logo" class="login-logo" />
        <h1 class="login-title">档案管理系统</h1>
        <p class="login-subtitle">Personnel Information Management System</p>
      </div>

      <!-- 登录表单 -->
      <a-form
        :model="formState"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="用户名"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <div class="login-options">
            <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
          </div>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 底部提示 -->
      <div class="login-footer">
        <p>默认账号: admin / admin123</p>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      © 2026 PIMS 档案管理系统
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const rememberMe = ref(true)

const formState = reactive({
  username: '',
  password: ''
})

// 登录
const handleLogin = async () => {
  loading.value = true
  try {
    const user = await authApi.login({
      username: formState.username,
      password: formState.password
    })
    
    userStore.login(user)
    message.success('登录成功')
    router.push('/')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    padding: 32px 24px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .login-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  
  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px;
  }
  
  .login-subtitle {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

.login-form {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  
  p {
    color: #999;
    font-size: 13px;
    margin: 0;
  }
}

.copyright {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

:deep(.ant-btn) {
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
}
</style>
