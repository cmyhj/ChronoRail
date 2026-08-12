import React, { useEffect, useState, useRef } from 'react';

interface MouseGlowOverlayProps {
  plusColor?: string;
  plusSize?: number;
}

/** 跟随鼠标的渐变纹理层：鼠标周围透明（看清内容），远离鼠标有纹理 */
export const MouseGlowOverlay: React.FC<MouseGlowOverlayProps> = ({
  plusColor = '#6366f1',
  plusSize = 60,
}) => {
  const [pos, setPos] = useState({ x: '50%', y: '50%' });
  const raf = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setPos({ x: `${x}%`, y: `${y}%` });
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const encodedColor = encodeURIComponent(plusColor);
  const svg = `url("data:image/svg+xml,%3Csvg width='${plusSize}' height='${plusSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodedColor}' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
      style={{
        background: `#0d0d12`,
      }}
    >
      {/* 纹理层：整屏铺满十字图案，但用跟随鼠标的圆形 mask 只在远离鼠标处显示 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: svg,
          backgroundSize: `${plusSize}px ${plusSize}px`,
          maskImage: `radial-gradient(circle 320px at ${pos.x} ${pos.y}, rgba(0,0,0,0.7) 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 320px at ${pos.x} ${pos.y}, rgba(0,0,0,0.7) 0%, transparent 100%)`,
          transition: 'mask-image 0.15s ease-out',
        }}
      />
    </div>
  );
};
