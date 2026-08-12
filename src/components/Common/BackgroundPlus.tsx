import React from 'react';

interface PlusPatternBackgroundProps {
  plusSize?: number;
  plusColor?: string;
  backgroundColor?: string;
  className?: string;
  fade?: boolean;
  style?: React.CSSProperties;
}

export const BackgroundPlus: React.FC<PlusPatternBackgroundProps> = ({
  plusColor = '#6366f1',
  backgroundColor = 'transparent',
  plusSize = 60,
  className = '',
  fade = true,
  style,
}) => {
  const encodedPlusColor = encodeURIComponent(plusColor);
  const svg = `url("data:image/svg+xml,%3Csvg width='${plusSize}' height='${plusSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodedPlusColor}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: svg,
    ...(fade && {
      maskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
      WebkitMaskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
    }),
  };

  if (style) Object.assign(backgroundStyle, style);

  return (
    <div
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      style={backgroundStyle}
    />
  );
};
