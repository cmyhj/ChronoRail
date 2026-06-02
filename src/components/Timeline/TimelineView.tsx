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

  // 计算时间范围 - 按月显示
  const dateRange = useMemo(() => {
    const start = currentDate.startOf('month');
    const end = currentDate.endOf('month');
    return { start, end };
  }, [currentDate]);

  // 生成时间刻度（每周一）
  const timeMarkers = useMemo(() => {
    const markers: dayjs.Dayjs[] = [];
    let current = dateRange.start;
    
    // 找到本月第一个周一（或月初）
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'day')) {
      markers.push(current);
      current = current.add(7, 'day');
    }
    
    return markers;
  }, [dateRange]);

  // 总天数
  const totalDays = useMemo(() => {
    return dateRange.end.diff(dateRange.start, 'day') + 1;
  }, [dateRange]);

  // 按游戏分组版本
  const versionsByGame = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    games.forEach(game => {
      grouped[game.id] = versions.filter(v => v.gameId === game.id);
    });
    return grouped;
  }, [games, versions]);

  // 导航 - 按月导航
  const navigate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    setCurrentDate(prev => prev.add(amount, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  // 缩放
  const zoomIn = () => {
    if (scale === 'month') setScale('day');
  };

  const zoomOut = () => {
    if (scale === 'day') setScale('month');
  };

  // 计算某天在时间轴上的位置百分比
  const getDayPosition = (date: dayjs.Dayjs): number => {
    const dayNum = date.diff(dateRange.start, 'day');
    return (dayNum / totalDays) * 100;
  };

  // 判断版本是否在当前月份范围内可见
  const isVersionVisible = (version: Version): boolean => {
    const versionStart = dayjs(version.startDate);
    const versionEnd = version.endDate ? dayjs(version.endDate) : versionStart.add(42, 'day');
    
    return versionStart.isBefore(dateRange.end) && versionEnd.isAfter(dateRange.start);
  };

  // 今天位置
  const todayPosition = useMemo(() => {
    if (!dayjs().isSame(currentDate, 'month')) return null;
    return getDayPosition(dayjs());
  }, [currentDate, dateRange, totalDays]);

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
            {scale === 'day' ? '日' : '月'}
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
          <div className="p-3 space-y-3">
            {games.map(game => {
              const gameVersions = (versionsByGame[game.id] || []).filter(isVersionVisible);
              return (
                <div key={game.id} className="bg-[#1a1a2e] rounded-xl p-3 border border-[#2d2d4a]">
                  <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.color }}
                    />
                    {game.name}
                  </h3>
                  <div className="space-y-2">
                    {gameVersions.map(version => (
                      <div
                        key={version.id}
                        onClick={() => onVersionClick?.(version)}
                        className="p-3 bg-[#252540] rounded-lg cursor-pointer active:bg-[#2d2d50] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#e2e8f0]">
                            v{version.version}
                          </span>
                          <span className="text-xs text-[#64748b]">
                            {dayjs(version.startDate).format('MM/DD')}
                            {version.endDate && ` - ${dayjs(version.endDate).format('MM/DD')}`}
                          </span>
                        </div>
                        <p className="text-xs text-[#94a3b8] truncate">{version.name}</p>
                      </div>
                    ))}
                    {gameVersions.length === 0 && (
                      <p className="text-xs text-[#64748b] text-center py-2">本月暂无版本</p>
                    )}
                  </div>
                </div>
              );
            })}
            {games.length === 0 && (
              <div className="text-center py-12 text-[#64748b]">
                暂无游戏，请先添加游戏
              </div>
            )}
            {/* 底部留白 */}
            <div className="h-4" />
          </div>
        ) : (
          // 桌面端：横向时间轴
          <div className="min-w-[800px] relative">
            {/* 时间刻度标题 */}
            <div className="flex border-b border-[#2d2d4a] bg-[#16162a] sticky top-0 z-10">
              <div className="w-48 shrink-0 px-4 py-2 border-r border-[#2d2d4a]">
                <span className="text-xs text-[#64748b]">游戏</span>
              </div>
              <div className="flex-1 relative h-8">
                {/* 日期刻度标签 */}
                {timeMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute text-xs text-[#64748b]"
                    style={{ left: `${getDayPosition(marker)}%` }}
                  >
                    <span className="ml-1">{marker.format('MM/DD')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 游戏行 */}
            {games.map(game => (
              <TimelineRow
                key={game.id}
                game={game}
                versions={(versionsByGame[game.id] || []).filter(isVersionVisible)}
                dateRange={dateRange}
                totalDays={totalDays}
                scale={scale}
                onVersionClick={onVersionClick}
                todayPosition={todayPosition}
              />
            ))}

            {games.length === 0 && (
              <div className="text-center py-12 text-[#64748b]">
                暂无游戏，请先添加游戏
              </div>
            )}

            {/* 底部留白，确保滚动条能滚到底部 */}
            <div className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
