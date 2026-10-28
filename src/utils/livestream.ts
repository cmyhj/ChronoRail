import type { Livestream, Version } from '../types';

/** Strict ISO subset: explicit zone, real calendar day, no date rollover. */
export function parseLivestreamTime(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi, s = '0', , zone, , oh = '0', om = '0'] = match;
  const [year, month, day, hour, minute, second, offsetHour, offsetMinute] =
    [y, mo, d, h, mi, s, oh, om].map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      hour > 23 || minute > 59 || second > 59 || offsetHour > 14 ||
      offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0) || zone === '-00:00') return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function safeOfficialUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value) || /[\s\\]/.test(value) ||
      Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return null;
  try {
    const url = new URL(value);
    return url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function livestreamStatus(livestream: Livestream | undefined, now: number) {
  const start = parseLivestreamTime(livestream?.startAt);
  const end = parseLivestreamTime(livestream?.endAt);
  if (start === null) return { text: livestream?.startAt ? '直播时间无效，待核实' : '直播时间待公布', start, end: null };
  // Invalid or reversed end times cannot establish that a broadcast ended.
  const validEnd = end !== null && end > start ? end : null;
  if (now < start) {
    const seconds = Math.ceil((start - now) / 1000);
    const text = `距直播 ${Math.floor(seconds / 86400)}天 ${Math.floor(seconds / 3600) % 24}小时 ${Math.floor(seconds / 60) % 60}分 ${seconds % 60}秒`;
    return { text, start, end: validEnd };
  }
  return { text: validEnd !== null && now >= validEnd ? '直播已结束' :
    validEnd !== null ? '直播已开始' : '直播已开始（结束时间未确认）', start, end: validEnd };
}

export function formatLivestreamTime(timestamp: number): string {
  return `${new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(timestamp)}（北京时间 UTC+08:00）`;
}

/** Homepage labels use Beijing calendar days, not elapsed 24-hour intervals. */
export function formatRelativeLivestreamTime(timestamp: number, now: number): string {
  const dayMs = 24 * 60 * 60 * 1000;
  const beijingOffset = 8 * 60 * 60 * 1000;
  const day = Math.floor((timestamp + beijingOffset) / dayMs);
  const today = Math.floor((now + beijingOffset) / dayMs);
  const daysAway = day - today;
  const date = new Date(timestamp + beijingOffset);
  const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0
  const todayWeekday = (new Date(today * dayMs).getUTCDay() + 6) % 7;
  const sameWeek = day - weekday === today - todayWeekday;
  const label = daysAway === 0 ? '今天' : daysAway === 1 ? '明天' : daysAway === 2 ? '后天' :
    `${sameWeek ? '' : '下'}周${'一二三四五六日'[weekday]}`;
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${label}${hours}:${minutes}`;
}

/** Homepage only: confirmed starts within the inclusive next 7 × 24 hours. */
export function selectLivestreamVersions(versions: Version[], gameId: string, now: number): Version[] {
  const windowEnd = now + 7 * 24 * 60 * 60 * 1000;
  return versions.filter(v => {
    if (v.gameId !== gameId) return false;
    const start = parseLivestreamTime(v.livestream?.startAt);
    return start !== null && start >= now && start <= windowEnd;
  }).sort((a, b) => parseLivestreamTime(a.livestream?.startAt)! - parseLivestreamTime(b.livestream?.startAt)!);
}
