// 二次元游戏风格主题配置
export const theme = {
  // 颜色
  colors: {
    // 主色调
    primary: {
      DEFAULT: '#6366f1',
      hover: '#4f46e5',
      light: '#818cf8',
      dark: '#4338ca',
    },
    // 背景色
    background: {
      dark: '#0f0f23',
      card: '#1a1a2e',
      cardHover: '#252540',
      sidebar: '#16162a',
    },
    // 文本色
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      muted: '#64748b',
    },
    // 边框色
    border: {
      DEFAULT: '#2d2d4a',
      hover: '#4a4a6a',
    },
    // 发光效果
    glow: {
      primary: 'rgba(99, 102, 241, 0.3)',
      subtle: 'rgba(99, 102, 241, 0.1)',
    },
    // 游戏主题色
    games: {
      genshin: '#4a90d9',
      starrail: '#e6a23c',
      zzz: '#67c23a',
      default: '#6366f1',
    },
  },
  
  // 字体
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  // 间距
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // 圆角
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // 阴影
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  },
  
  // 动画
  animations: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  
  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// 生成CSS变量
export function generateCSSVariables(): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary.DEFAULT};
      --color-primary-hover: ${theme.colors.primary.hover};
      --color-primary-light: ${theme.colors.primary.light};
      --color-primary-dark: ${theme.colors.primary.dark};
      --color-bg-dark: ${theme.colors.background.dark};
      --color-bg-card: ${theme.colors.background.card};
      --color-bg-card-hover: ${theme.colors.background.cardHover};
      --color-bg-sidebar: ${theme.colors.background.sidebar};
      --color-text-primary: ${theme.colors.text.primary};
      --color-text-secondary: ${theme.colors.text.secondary};
      --color-text-muted: ${theme.colors.text.muted};
      --color-border: ${theme.colors.border.DEFAULT};
      --color-border-hover: ${theme.colors.border.hover};
      --color-glow-primary: ${theme.colors.glow.primary};
      --color-glow-subtle: ${theme.colors.glow.subtle};
      --font-sans: ${theme.fonts.sans};
      --font-mono: ${theme.fonts.mono};
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-glow: ${theme.shadows.glow};
    }
  `;
}
