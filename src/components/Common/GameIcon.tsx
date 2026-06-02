import React from 'react';

interface GameIconProps {
  gameId: string;
  size?: number;
  className?: string;
}

// 米哈游游戏SVG图标
const gameIcons: Record<string, React.ReactNode> = {
  genshin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  starrail: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  zzz: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

export const GameIcon: React.FC<GameIconProps> = ({
  gameId,
  size = 24,
  className = '',
}) => {
  const icon = gameIcons[gameId] || gameIcons.default;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  );
};

// 游戏颜色配置
export const gameColors: Record<string, string> = {
  genshin: '#4a90d9',
  starrail: '#e6a23c',
  zzz: '#67c23a',
  default: '#6366f1',
};

// 游戏名称配置
export const gameNames: Record<string, string> = {
  genshin: '原神',
  starrail: '崩坏：星穹铁道',
  zzz: '绝区零',
};
