import { LayoutDashboard, Calendar, Gamepad2, Dice5 } from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/', label: '总览', lucideIcon: LayoutDashboard },
  { path: '/calendar', label: '日历', lucideIcon: Calendar },
  { path: '/games', label: '游戏管理', lucideIcon: Gamepad2 },
  { path: '/random', label: '随机数', lucideIcon: Dice5 },
] as const;
