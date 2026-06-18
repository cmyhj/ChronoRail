import dayjs from 'dayjs';

/**
 * 获取当前时间戳
 * @returns ISO格式的时间戳
 */
export function getCurrentTimestamp(): string {
  return dayjs().toISOString();
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
