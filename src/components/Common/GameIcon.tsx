import React, { useState } from 'react';
import { gameIconUrls, gameIcons, gameColors } from './gameData';

interface GameIconProps {
  gameId: string;
  size?: number;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  gameId,
  size = 24,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const iconUrl = gameIconUrls[gameId];
  const svgIcon = gameIcons[gameId] || gameIcons.default;

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
          className="object-cover rounded-md"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color: gameColors[gameId] || gameColors.default }}
    >
      {svgIcon}
    </div>
  );
};
