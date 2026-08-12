import React, { useState, useMemo, useCallback } from 'react';
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

  const gamesMap = useMemo(() => {
    const map = new Map<string, Game>();
    games.forEach((g) => map.set(g.id, g));
    return map;
  }, [games]);

  const calendarDays = useMemo(() => {
    const year = currentDate.year();
    const month = currentDate.month();

    const firstDay = dayjs().year(year).month(month).startOf('month');
    const lastDay = dayjs().year(year).month(month).endOf('month');

    const startDayOfWeek = firstDay.day();

    const days: Array<{ date: dayjs.Dayjs; isCurrentMonth: boolean }> = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: firstDay.subtract(i + 1, 'day'),
        isCurrentMonth: false,
      });
    }

    let current = firstDay;
    while (current.isBefore(lastDay) || current.isSame(lastDay, 'day')) {
      days.push({
        date: current,
        isCurrentMonth: true,
      });
      current = current.add(1, 'day');
    }

    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({
        date: lastDay.add(i + 1, 'day'),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const versionsByDate = useMemo(() => {
    const grouped: Record<string, Version[]> = {};

    versions.forEach((version) => {
      const dateKey = dayjs(version.startDate).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(version);
    });

    return grouped;
  }, [versions]);

  const selectedDateVersions = useMemo(() => {
    if (!selectedDate) return [];
    return versionsByDate[selectedDate] || [];
  }, [selectedDate, versionsByDate]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => prev.add(direction === 'prev' ? -1 : 1, 'month'));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  const handleDayClick = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="flex items-center justify-center w-8 h-8 text-fg-3 hover:text-fg hover:bg-white/[0.05] rounded-lg transition-colors duration-150"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-base font-semibold text-fg tabular-nums min-w-[120px] text-center">
              {currentDate.format('YYYY年MM月')}
            </span>

            <button
              onClick={() => navigate('next')}
              className="flex items-center justify-center w-8 h-8 text-fg-3 hover:text-fg hover:bg-white/[0.05] rounded-lg transition-colors duration-150"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-[12px] font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-md transition-colors duration-150"
          >
            今天
          </button>
        </div>

        {/* Calendar body */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Calendar grid */}
          <div className="flex-1 bg-panel/80 backdrop-blur-xl rounded-xl border border-line p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-medium text-fg-4 py-1.5"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, isCurrentMonth }) => {
                const dateKey = date.format('YYYY-MM-DD');
                const dayVersions = versionsByDate[dateKey] || [];
                const isSelected = selectedDate === dateKey;
                const isToday = date.isSame(dayjs(), 'day');

                return (
                  <CalendarDay
                    key={dateKey}
                    date={date}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    isSelected={isSelected}
                    versions={dayVersions}
                    gamesMap={gamesMap}
                    onClick={handleDayClick}
                    dateKey={dateKey}
                  />
                );
              })}
            </div>
          </div>

          {/* Side detail */}
          {selectedDate && (
            <div className="lg:w-72 bg-panel/80 backdrop-blur-xl rounded-xl border border-line p-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-fg mb-3">
                {dayjs(selectedDate).format('YYYY年MM月DD日')}
              </h3>

              {selectedDateVersions.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateVersions.map((version) => {
                    const game = gamesMap.get(version.gameId);
                    return (
                      <div
                        key={version.id}
                        onClick={() => onVersionClick?.(version)}
                        className="p-2.5 bg-card rounded-lg border border-line cursor-pointer hover:border-line-strong transition-colors duration-150"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: game?.color || '#6366f1' }}
                          />
                          <span className="text-[10px] text-fg-3">{game?.name}</span>
                        </div>
                        <div className="text-[13px] font-medium text-fg">
                          v{version.version} - {version.name}
                        </div>
                        {version.description && (
                          <p className="text-[11px] text-fg-3 line-clamp-2 mt-1">
                            {version.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] text-fg-4 text-center py-6">
                  当天没有版本更新
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
