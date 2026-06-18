import { Clock, Calendar, Gamepad2 } from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/', label: '时间轴', emoji: '📅', lucideIcon: Clock },
  { path: '/calendar', label: '日历', emoji: '🗓️', lucideIcon: Calendar },
  { path: '/games', label: '游戏管理', emoji: '🎮', lucideIcon: Gamepad2 },
] as const;
