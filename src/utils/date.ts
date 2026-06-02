import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param date 日期字符串
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

/**
 * 计算两个日期之间的天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数
 */
export function daysBetween(startDate: string, endDate: string): number {
  return dayjs(endDate).diff(dayjs(startDate), 'day');
}

/**
 * 计算距今天数
 * @param date 日期字符串
 * @returns 距今天数
 */
export function daysFromNow(date: string): number {
  return dayjs().diff(dayjs(date), 'day');
}

/**
 * 获取当前日期
 * @returns 当前日期字符串
 */
export function getCurrentDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 获取当前时间戳
 * @returns ISO格式的时间戳
 */
export function getCurrentTimestamp(): string {
  return dayjs().toISOString();
}

/**
 * 判断日期是否在范围内
 * @param date 要检查的日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 是否在范围内
 */
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = dayjs(date);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return d.isAfter(start) && d.isBefore(end);
}

/**
 * 获取月份的所有日期
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 日期数组
 */
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const lastDay = dayjs().year(year).month(month).endOf('month');
  
  const days: Date[] = [];
  let current = firstDay;
  
  while (current.isBefore(lastDay) || current.isSame(lastDay, 'day')) {
    days.push(current.toDate());
    current = current.add(1, 'day');
  }
  
  return days;
}

/**
 * 获取星期几
 * @param date 日期
 * @returns 星期几 (0-6)
 */
export function getDayOfWeek(date: Date): number {
  return dayjs(date).day();
}

/**
 * 判断是否是今天
 * @param date 日期字符串
 * @returns 是否是今天
 */
export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 获取相对时间描述
 * @param date 日期字符串
 * @returns 相对时间描述
 */
export function getRelativeTime(date: string): string {
  const days = daysFromNow(date);
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days === -1) return '明天';
  if (days > 0) return `${days}天前`;
  return `${Math.abs(days)}天后`;
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
