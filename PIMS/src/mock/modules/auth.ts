import Mock from 'mockjs'
import { KEYS, getList, saveList, getCurrentTime } from '../utils'
import type { User } from '@/types'

// 登录接口
Mock.mock(/\/api\/login/, 'post', (options: any) => {
  const { username, password } = JSON.parse(options.body)
  const users = getList<User>(KEYS.USERS)
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    user.lastLoginTime = getCurrentTime()
    saveList(KEYS.USERS, users)
    const { password: _, ...userInfo } = user
    return { code: 200, data: userInfo, message: '登录成功' }
  }
  
  return { code: 401, data: null, message: '用户名或密码错误' }
})
