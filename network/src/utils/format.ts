/**
 * 通用格式化工具函数
 */

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @returns 格式化后的字符串，如 "1.5 GB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param successMessage 复制成功提示消息
 */
export async function copyToClipboard(text: string, successMessage = '已复制到剪贴板'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    const { message } = await import('antd');
    message.success(successMessage);
    return true;
  } catch {
    const { message } = await import('antd');
    message.error('复制失败');
    return false;
  }
}

/**
 * 去除字符串首尾空格
 */
export function trim(str: string) {
  return str.trim();
}
