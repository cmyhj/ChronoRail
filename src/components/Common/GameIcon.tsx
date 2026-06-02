import React, { useState } from 'react';

interface GameIconProps {
  gameId: string;
  iconUrl?: string;  // 支持自定义图标URL
  size?: number;
  className?: string;
}

// SVG图标（内置，不会失效）
const gameIcons: Record<string, React.ReactNode> = {
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
      <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  ),
  zzz: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wutheringwaves: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
    </svg>
  ),
  arknights: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5z" fill="currentColor"/>
      <path d="M12 7l-5 10h10L12 7z" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  reverse1999: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 8v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  arknights_endfield: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5z" fill="currentColor"/>
      <path d="M12 6l-4 8h8l-4-8z" fill="currentColor"/>
      <path d="M12 10l-2 4h4l-2-4z" fill="white"/>
    </svg>
  ),
  yihuan: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 12C8 9.79 9.79 8 12 8s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="currentColor"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  doublehelix: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

export const GameIcon: React.FC<GameIconProps> = ({
  gameId,
  iconUrl,
  size = 24,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const svgIcon = gameIcons[gameId] || gameIcons.default;

  // 如果有自定义图片URL且未加载失败，显示图片
  if (iconUrl && !imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center overflow-hidden rounded-md ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={iconUrl}
          alt={gameId}
          width={size}
          height={size}
          className="object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 否则显示SVG图标
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color: gameColors[gameId] || gameColors.default }}
    >
      {svgIcon}
    </div>
  );
};

// 游戏颜色配置
export const gameColors: Record<string, string> = {
  genshin: '#4a90d9',
  starrail: '#e6a23c',
  zzz: '#67c23a',
  wutheringwaves: '#00b4d8',
  arknights: '#f4845f',
  reverse1999: '#7c3aed',
  arknights_endfield: '#f97316',
  yihuan: '#14b8a6',
  doublehelix: '#ec4899',
  default: '#6366f1',
};

// 游戏名称配置
export const gameNames: Record<string, string> = {
  genshin: '原神',
  starrail: '崩坏：星穹铁道',
  zzz: '绝区零',
  wutheringwaves: '鸣潮',
  arknights: '明日方舟',
  reverse1999: '重返未来:1999',
  arknights_endfield: '明日方舟:终末地',
  yihuan: '异环',
  doublehelix: '二重螺旋',
};
