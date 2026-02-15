import Mock from 'mockjs'

// ==================== 重要：首先导入初始化模块 ====================
// 这个模块必须在所有其他 mock 模块之前导入
// 确保基础数据（角色、用户、标签、分类、人员档案）在组织成员数据之前初始化
import './init'

// 设置 Mock 延迟
Mock.setup({ timeout: '100-300' })

// ==================== 导入所有 Mock 模块 ====================
import './modules/auth'
import './modules/personnel'
import './modules/user'
import './modules/tag'
import './modules/category'
import './modules/role'
import './modules/position'
import './modules/positionTag'
import './modules/organization'

console.log('[Mock] Mock.js initialized successfully')
