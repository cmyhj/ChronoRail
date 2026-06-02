import { useState, useEffect, useCallback } from 'react';

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * 响应式布局Hook
 */
export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setWindowSize({ width, height });
    setIsMobile(width < breakpoints.md);
    setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
    setIsDesktop(width >= breakpoints.lg);
  }, [breakpoints]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // 断点判断
  const isSm = windowSize.width >= breakpoints.sm;
  const isMd = windowSize.width >= breakpoints.md;
  const isLg = windowSize.width >= breakpoints.lg;
  const isXl = windowSize.width >= breakpoints.xl;
  const is2xl = windowSize.width >= breakpoints['2xl'];

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
  };
}
