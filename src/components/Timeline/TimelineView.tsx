import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import dayjs from 'dayjs';
import { TimelineRow } from './TimelineRow';
import { useResponsive } from '../../hooks/useResponsive';
import type { Game, Version, TimelineScale } from '../../types';

interface TimelineViewProps {
  games: Game[];
  versions: Version[];
  onVersionClick?: (version: Version) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  games,
  versions,
  onVersionClick,
}) => {
  const { isMobile } = useResponsive();
  const [scale, setScale] = useState<TimelineScale>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());

  // 计算时间范围
  const dateRange = useMemo(() => {
    const start = currentDate.startOf(scale === 'day' ? 'week' : scale === 'week' ? 'month' : 'year');
    const end = currentDate.endOf(scale === 'day' ? 'week' : scale === 'week' ? 'month' : 'year');
    return { start, end };
  }, [currentDate, scale]);

  // 生成时间刻度
  const timeMarkers = useMemo(() => {
    const markers: dayjs.Dayjs[] = [];
    let current = dateRange.start;
    
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'day')) {
      markers.push(current);
      current = current.add(1, scale === 'day' ? 'day' : scale === 'week' ? 'week' : 'month');
    }
    
    return markers;
  }, [dateRange, scale]);

  // 按游戏分组版本
  const versionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach(game => {
      grouped[game.id] = versions.filter(v => v.gameId === game.id);
    });
    return grouped;
  }, [games, versions]);

  // 导航
  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    setCurrentDate(prev => prev.add(amount, scale === 'day' ? 'week' : scale === 'week' ? 'month' : 'year'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  // 缩放
  const zoomIn = () => {
    if (scale === 'month') setScale('week');
    else if (scale === 'week') setScale('day');
  };

  const zoomOut = () => {
    if (scale === 'day') setScale('week');
    else if (scale === 'week') setScale('month');
  };

  // 格式化刻度标签
  const formatMarkerLabel = (date: dayjs.Dayjs) => {
    if (scale === 'day') return date.format('MM/DD');
    if (scale === 'week') return date.format('MM/DD');
    return date.format('YYYY/MM');
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('prev')}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            今天
          </button>
          
          <button
            onClick={() => navigate('next')}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          
          <span className="text-[#e2e8f0] font-medium ml-2">
            {currentDate.format('YYYY年MM月')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
            disabled={scale === 'month'}
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="text-xs text-[#64748b] min-w-[40px] text-center">
            {scale === 'day' ? '日' : scale === 'week' ? '周' : '月'}
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors"
            disabled={scale === 'day'}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 overflow-auto">
        {isMobile ? (
          // 移动端：纵向布局
          <div className="p-4 space-y-4">
            {games.map(game => (
              <div key={game.id} className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2d2d4a]">
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: game.color }}
                  />
                  {game.name}
                </h3>
                <div className="space-y-2">
                  {(versionsByGame[game.id] || []).map(version => (
                    <div
                      key={version.id}
                      onClick={() => onVersionClick?.(version)}
                      className="p-3 bg-[#252540] rounded-lg cursor-pointer hover:bg-[#2d2d50] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#e2e8f0]">
                          v{version.version}
                        </span>
                        <span className="text-xs text-[#64748b]">
                          {dayjs(version.startDate).format('MM/DD')}
                        </span>
                      </div>
                      <p className="text-xs text-[#94a3b8] truncate">{version.name}</p>
                    </div>
                  ))}
                  {(!versionsByGame[game.id] || versionsByGame[game.id].length === 0) && (
                    <p className="text-xs text-[#64748b] text-center py-2">暂无版本数据</p>
                  )}
                </div>
              </div>
            ))}
            {games.length === 0 && (
              <div className="text-center py-12 text-[#64748b]">
                暂无游戏，请先添加游戏
              </div>
            )}
          </div>
        ) : (
          // 桌面端：横向时间轴
          <div className="min-w-[800px]">
            {/* 时间刻度 */}
            <div className="flex border-b border-[#2d2d4a] bg-[#16162a] sticky top-0 z-10">
              <div className="w-48 shrink-0 px-4 py-2 border-r border-[#2d2d4a]">
                <span className="text-xs text-[#64748b]">游戏</span>
              </div>
              <div className="flex-1 flex">
                {timeMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className="flex-1 px-2 py-2 text-center border-r border-[#2d2d4a] last:border-r-0"
                  >
                    <span className="text-xs text-[#64748b]">
                      {formatMarkerLabel(marker)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 游戏行 */}
            {games.map(game => (
              <TimelineRow
                key={game.id}
                game={game}
                versions={versionsByGame[game.id] || []}
                dateRange={dateRange}
                scale={scale}
                onVersionClick={onVersionClick}
              />
            ))}

            {games.length === 0 && (
              <div className="text-center py-12 text-[#64748b]">
                暂无游戏，请先添加游戏
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
