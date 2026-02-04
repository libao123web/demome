import dayjs from 'dayjs'

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 身份证号脱敏
 */
export function maskIdNumber(idNumber: string): string {
  if (!idNumber || idNumber.length < 10) return idNumber
  return idNumber.replace(/(\d{3})\d+(\d{4})/, '$1********$2')
}

/**
 * 生成唯一ID
 */
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

/**
 * 获取当前时间字符串
 */
export function getCurrentTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 状态文本映射
 */
export const statusMap = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'processing' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
  active: { text: '正常', color: 'success' },
  disabled: { text: '禁用', color: 'error' }
}

/**
 * 获取状态显示配置
 */
export function getStatusConfig(status: string) {
  return statusMap[status as keyof typeof statusMap] || { text: status, color: 'default' }
}
