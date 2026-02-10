import { ref, reactive } from 'vue'
import type { PageResult } from '@/types'

interface UseTableOptions<T, P extends Record<string, any>> {
  /** API 请求函数 */
  fetchApi: (params: P & { page: number; pageSize: number }) => Promise<PageResult<T>>
  /** 默认每页条数 */
  defaultPageSize?: number
  /** 默认搜索参数 */
  defaultSearchParams?: P
  /** 是否立即加载 */
  immediate?: boolean
}

export function useTable<T = any, P extends Record<string, any> = Record<string, any>>(
  options: UseTableOptions<T, P>
) {
  const { fetchApi, defaultPageSize = 10, defaultSearchParams } = options

  // 加载状态
  const loading = ref(false)

  // 数据源
  const dataSource = ref<T[]>([]) as ReturnType<typeof ref<T[]>>

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`
  })

  // 搜索参数
  const searchParams = reactive<P>((defaultSearchParams ? { ...defaultSearchParams } : {}) as P)

  // 加载数据
  const loadData = async () => {
    loading.value = true
    try {
      const res = await fetchApi({
        ...searchParams,
        page: pagination.current,
        pageSize: pagination.pageSize
      } as P & { page: number; pageSize: number })
      dataSource.value = res.data as any
      pagination.total = res.total
    } catch (error) {
      console.error('加载数据失败', error)
    } finally {
      loading.value = false
    }
  }

  // 处理表格变化（分页、排序等）
  const handleTableChange = (pag: any) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    loadData()
  }

  // 搜索
  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  // 重置搜索
  const resetSearch = () => {
    if (defaultSearchParams) {
      Object.assign(searchParams, defaultSearchParams)
    } else {
      Object.keys(searchParams).forEach(key => {
        ;(searchParams as any)[key] = undefined
      })
    }
    handleSearch()
  }

  // 刷新（保持当前页）
  const refresh = () => {
    loadData()
  }

  return {
    loading,
    dataSource,
    pagination,
    searchParams,
    loadData,
    handleTableChange,
    handleSearch,
    resetSearch,
    refresh
  }
}
