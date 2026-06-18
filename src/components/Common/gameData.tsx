import React from 'react';
import { GAME_CONFIGS } from '../../utils/parser';

// 游戏官方图标URL（来自App Store）
export const gameIconUrls: Record<string, string> = {
  genshin: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/27/b6/e4/27b6e435-c1df-2563-9eb1-73b99fadb1d0/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg',
  starrail: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/16/6d/07/166d07c4-f11c-33f3-eda9-a2cfa839fc85/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  zzz: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ba/24/b9/ba24b9a7-ce58-d64a-0247-46f81deec2fa/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg',
  wutheringwaves: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/2e/df/d3/2edfd3d3-fa5a-57c0-2e5d-fb5946d6fe8b/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  arknights: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/54/1d/e6/541de6f1-e719-d7c2-3df3-116602340b3c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  reverse1999: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/42/24/82/42248216-6ef8-a713-e131-942c7abd5141/AppIcon-0-0-1x_U007emarketing-0-8-0-0-85-220.png/512x512bb.jpg',
  arknights_endfield: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/76/80/88768037-1209-c3a2-585b-944efdfdfce1/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  yihuan: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a5/81/31/a5813161-38c3-1295-978f-9fd4f9c4bd16/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  doublehelix: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fb/0d/b9/fb0db9ef-702b-44a8-5f99-4a0fd9955964/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
};

// SVG图标备用方案
export const gameIcons: Record<string, React.ReactNode> = {
  genshin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 2L15 8L12 7L9 8L12 2Z" fill="currentColor"/>
      <path d="M12 22L9 16L12 17L15 16L12 22Z" fill="currentColor"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  ),
  starrail: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  zzz: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wutheringwaves: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  arknights: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="currentColor"/>
    </svg>
  ),
  reverse1999: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 8v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  arknights_endfield: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="currentColor"/>
      <path d="M12 6l-4 8h8l-4-8z" fill="white"/>
    </svg>
  ),
  yihuan: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 12C8 9.79 9.79 8 12 8s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="currentColor"/>
    </svg>
  ),
  doublehelix: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};

// 游戏颜色配置（从 GAME_CONFIGS 派生）
export const gameColors: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(GAME_CONFIGS).map(([id, config]) => [id, config.color])
  ),
  default: '#6366f1',
};
