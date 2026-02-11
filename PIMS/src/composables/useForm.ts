import { ref, reactive, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'

interface UseFormOptions<T> {
  /** 表单默认值 */
  defaultValues: T
  /** 创建 API */
  createApi?: (data: T) => Promise<any>
  /** 更新 API */
  updateApi?: (id: string | number, data: T) => Promise<any>
  /** 提交成功回调 */
  onSuccess?: () => void
  /** 提交成功消息 */
  successMessage?: { create?: string; update?: string }
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { 
    defaultValues, 
    createApi, 
    updateApi, 
    onSuccess,
    successMessage = { create: '新增成功', update: '更新成功' }
  } = options

  // 抽屉/弹窗状态
  const visible = ref(false)
  const isEdit = ref(false)
  const submitLoading = ref(false)
  const currentId = ref<string | number>('')

  // 表单 ref
  const formRef = ref<FormInstance>()

  // 表单数据
  const formState = reactive<T>({ ...defaultValues })

  // 打开新增表单
  const openCreate = () => {
    isEdit.value = false
    resetForm()
    visible.value = true
  }

  // 打开编辑表单
  const openEdit = (record: T & { id: string | number }) => {
    isEdit.value = true
    currentId.value = record.id
    Object.assign(formState, record)
    visible.value = true
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(formState, defaultValues)
    currentId.value = ''
    formRef.value?.resetFields()
  }

  // 关闭表单
  const close = () => {
    visible.value = false
    resetForm()
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitLoading.value = true

      if (isEdit.value) {
        if (updateApi) {
          await updateApi(currentId.value, { ...formState } as T)
          message.success(successMessage.update || '更新成功')
        }
      } else {
        if (createApi) {
          await createApi({ ...formState } as T)
          message.success(successMessage.create || '新增成功')
        }
      }

      visible.value = false
      resetForm()
      onSuccess?.()
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证失败，不弹错误提示
        return
      }
      message.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  }

  // 监听 visible 变化，关闭时重置表单
  watch(visible, (val) => {
    if (!val) {
      // 延迟重置，等待抽屉关闭动画完成
      setTimeout(() => {
        if (!visible.value) {
          resetForm()
        }
      }, 300)
    }
  })

  return {
    visible,
    isEdit,
    submitLoading,
    currentId,
    formRef,
    formState,
    openCreate,
    openEdit,
    resetForm,
    close,
    handleSubmit
  }
}
