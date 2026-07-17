import { Clock, Calendar, Gamepad2, Dice5 } from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/', label: '时间轴', emoji: '📅', lucideIcon: Clock },
  { path: '/calendar', label: '日历', emoji: '🗓️', lucideIcon: Calendar },
  { path: '/games', label: '游戏管理', emoji: '🎮', lucideIcon: Gamepad2 },
  { path: '/random', label: '随机数', emoji: '🎲', lucideIcon: Dice5 },
] as const;
