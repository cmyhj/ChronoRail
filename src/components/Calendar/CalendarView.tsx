import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { CalendarDay } from './CalendarDay';
import type { Game, Version } from '../../types';

interface CalendarViewProps {
  games: Game[];
  versions: Version[];
  onVersionClick?: (version: Version) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  games,
  versions,
  onVersionClick,
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 获取当前月份的日期
  const calendarDays = useMemo(() => {
    const year = currentDate.year();
    const month = currentDate.month();
    
    const firstDay = dayjs().year(year).month(month).startOf('month');
    const lastDay = dayjs().year(year).month(month).endOf('month');
    
    // 获取第一天是星期几（0-6，0是周日）
    const startDayOfWeek = firstDay.day();
    
    const days: Array<{ date: dayjs.Dayjs; isCurrentMonth: boolean }> = [];
    
    // 添加上个月的日期
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: firstDay.subtract(i + 1, 'day'),
        isCurrentMonth: false,
      });
    }
    
    // 添加本月的日期
    let current = firstDay;
    while (current.isBefore(lastDay) || current.isSame(lastDay, 'day')) {
      days.push({
        date: current,
        isCurrentMonth: true,
      });
      current = current.add(1, 'day');
    }
    
    // 添加下个月的日期（补齐6行）
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({
        date: lastDay.add(i + 1, 'day'),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  // 获取每天的版本
  const versionsByDate = useMemo(() => {
    const grouped: Record<string, Version[]> = {};
    
    versions.forEach(version => {
      const dateKey = dayjs(version.startDate).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(version);
    });
    
    return grouped;
  }, [versions]);

  // 获取选中日期的版本
  const selectedDateVersions = useMemo(() => {
    if (!selectedDate) return [];
    return versionsByDate[selectedDate] || [];
  }, [selectedDate, versionsByDate]);

  // 获取游戏信息
  const getGame = (gameId: string) => games.find(g => g.id === gameId);

  // 导航
  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => prev.add(direction === 'prev' ? -1 : 1, 'month'));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  };

  // 星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

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
      </div>

      {/* 日历内容 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 日历网格 */}
        <div className="flex-1 p-4 overflow-auto">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-[#64748b] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateKey = date.format('YYYY-MM-DD');
              const dayVersions = versionsByDate[dateKey] || [];
              const isSelected = selectedDate === dateKey;
              const isToday = date.isSame(dayjs(), 'day');

              return (
                <CalendarDay
                  key={index}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  isSelected={isSelected}
                  versions={dayVersions}
                  games={games}
                  onClick={() => setSelectedDate(dateKey)}
                />
              );
            })}
          </div>
        </div>

        {/* 侧边详情 */}
        {selectedDate && (
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-[#2d2d4a] bg-[#16162a] overflow-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4">
                {dayjs(selectedDate).format('YYYY年MM月DD日')}
              </h3>

              {selectedDateVersions.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateVersions.map(version => {
                    const game = getGame(version.gameId);
                    return (
                      <div
                        key={version.id}
                        onClick={() => onVersionClick?.(version)}
                        className="p-3 bg-[#1a1a2e] rounded-lg border border-[#2d2d4a] cursor-pointer hover:border-[#6366f1]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: game?.color || '#6366f1' }}
                          />
                          <span className="text-xs text-[#94a3b8]">{game?.name}</span>
                        </div>
                        <div className="text-sm font-medium text-[#e2e8f0] mb-1">
                          v{version.version} - {version.name}
                        </div>
                        {version.description && (
                          <p className="text-xs text-[#64748b] line-clamp-2">
                            {version.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#64748b] text-center py-8">
                  当天没有版本更新
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
