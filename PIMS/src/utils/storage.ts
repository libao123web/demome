/**
 * LocalStorage 封装
 */

// 存储键前缀
const PREFIX = 'pims_'

/**
 * 获取存储数据
 */
export function getStorage<T = any>(key: string): T | null {
  const fullKey = key.startsWith(PREFIX) ? key : PREFIX + key
  const data = localStorage.getItem(fullKey)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return data as T
  }
}

/**
 * 设置存储数据
 */
export function setStorage<T = any>(key: string, value: T): void {
  const fullKey = key.startsWith(PREFIX) ? key : PREFIX + key
  localStorage.setItem(fullKey, JSON.stringify(value))
}

/**
 * 移除存储数据
 */
export function removeStorage(key: string): void {
  const fullKey = key.startsWith(PREFIX) ? key : PREFIX + key
  localStorage.removeItem(fullKey)
}

/**
 * 清空所有存储数据
 */
export function clearStorage(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 获取列表数据（带分页）
 */
export function getListFromStorage<T>(key: string): T[] {
  return getStorage<T[]>(key) || []
}

/**
 * 保存列表数据
 */
export function saveListToStorage<T>(key: string, list: T[]): void {
  setStorage(key, list)
}

/**
 * 添加数据到列表
 */
export function addToStorage<T extends { id: number }>(key: string, item: T): T {
  const list = getListFromStorage<T>(key)
  item.id = Date.now()
  list.push(item)
  saveListToStorage(key, list)
  return item
}

/**
 * 更新列表中的数据
 */
export function updateInStorage<T extends { id: number }>(key: string, item: T): boolean {
  const list = getListFromStorage<T>(key)
  const index = list.findIndex(i => i.id === item.id)
  if (index > -1) {
    list[index] = { ...list[index], ...item }
    saveListToStorage(key, list)
    return true
  }
  return false
}

/**
 * 从列表中删除数据
 */
export function removeFromStorage<T extends { id: number }>(key: string, id: number): boolean {
  const list = getListFromStorage<T>(key)
  const filtered = list.filter(i => i.id !== id)
  if (filtered.length < list.length) {
    saveListToStorage(key, filtered)
    return true
  }
  return false
}
