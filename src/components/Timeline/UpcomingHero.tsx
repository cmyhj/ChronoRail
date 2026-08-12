import React, { useMemo } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import dayjs from 'dayjs';
import { GameIcon } from '../Common/GameIcon';
import { CardSpotlight } from '../ui/card-spotlight';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import type { Game, Version, Banner } from '../../types';

interface UpcomingHeroProps {
  games: Game[];
  versions: Version[];
  allBanners: Record<string, Banner[]>;
}

interface UpcomingItem {
  game: Game;
  nextEvent: {
    type: 'banner' | 'version';
    name: string;
    character?: string;
    startDate: string;
    endDate?: string;
  } | null;
  daysUntil: number;
}

export const UpcomingHero: React.FC<UpcomingHeroProps> = ({
  games,
  versions,
  allBanners,
}) => {
  const upcoming = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');

    return games
      .map((game): UpcomingItem => {
        const banners = allBanners[game.id] || [];
        const gameVersions = versions.filter((v) => v.gameId === game.id);

        // Find the next upcoming banner
        const futureBanners = banners
          .filter((b) => b.startDate > today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (futureBanners.length > 0) {
          const next = futureBanners[0];
          const days = dayjs(next.startDate).startOf('day').diff(dayjs().startOf('day'), 'day');
          return {
            game,
            nextEvent: {
              type: 'banner',
              name: next.name,
              character: next.character,
              startDate: next.startDate,
              endDate: next.endDate,
            },
            daysUntil: days,
          };
        }

        // Find ongoing banners (check when they end)
        const ongoingBanners = banners.filter(
          (b) => b.startDate <= today && b.endDate > today
        );
        if (ongoingBanners.length > 0) {
          const soonestEnding = ongoingBanners.sort((a, b) =>
            a.endDate.localeCompare(b.endDate)
          )[0];
          const days = dayjs(soonestEnding.endDate).startOf('day').diff(dayjs().startOf('day'), 'day');
          return {
            game,
            nextEvent: {
              type: 'banner',
              name: soonestEnding.name,
              character: soonestEnding.character,
              startDate: soonestEnding.startDate,
              endDate: soonestEnding.endDate,
            },
            daysUntil: days,
          };
        }

        // Find next version
        const futureVersions = gameVersions
          .filter((v) => v.startDate > today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (futureVersions.length > 0) {
          const next = futureVersions[0];
          const days = dayjs(next.startDate).startOf('day').diff(dayjs().startOf('day'), 'day');
          return {
            game,
            nextEvent: {
              type: 'version',
              name: `v${next.version}`,
              startDate: next.startDate,
              endDate: next.endDate,
            },
            daysUntil: days,
          };
        }

        return { game, nextEvent: null, daysUntil: Infinity };
      })
      .filter((item) => item.nextEvent !== null)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  }, [games, versions, allBanners]);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Zap size={14} className="text-accent" />
        <TextGenerateEffect
          words="即将到来"
          className="text-xs font-semibold uppercase tracking-wider"
          duration={0.6}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {upcoming.map((item) => {
          const color = item.game.color;
          const isImminent = item.daysUntil <= 3;

          return (
            <CardSpotlight
              key={item.game.id}
              color={color}
              className={`
                group/spotlight p-3 rounded-xl border transition-all duration-200 cursor-default
                flex items-center gap-3
                bg-card/60 backdrop-blur-xl
                ${isImminent ? 'border-accent/20' : 'border-line hover:border-line-strong'}
              `}
            >
              {/* Color accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl z-10"
                style={{ backgroundColor: color }}
              />

              <div className="relative shrink-0 ml-1 z-10">
                <GameIcon gameId={item.game.id} size={32} />
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-medium text-fg-3 truncate">
                    {item.game.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.nextEvent?.character && (
                    <span
                      className="text-[12px] font-semibold truncate"
                      style={{ color }}
                    >
                      {item.nextEvent.character}
                    </span>
                  )}
                  {item.nextEvent?.character && (
                    <ArrowRight size={10} className="text-fg-4 shrink-0" />
                  )}
                  <span className="text-[11px] text-fg-2 truncate">
                    {item.nextEvent?.type === 'banner' ? item.nextEvent.name : item.nextEvent?.name}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right flex flex-col items-end gap-1 relative z-10">
                {item.daysUntil <= 0 ? (
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold text-white bg-accent rounded-full">
                    今天
                  </span>
                ) : item.daysUntil <= 3 ? (
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold text-accent bg-accent/10 rounded-full">
                    {item.daysUntil}天后
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-medium text-fg-2 bg-white/[0.05] rounded-full">
                    {item.daysUntil}天后
                  </span>
                )}
                <span className="text-[10px] text-fg-4 tabular-nums">
                  {dayjs(item.nextEvent?.startDate).format('MM/DD')}
                </span>
              </div>
            </CardSpotlight>
          );
        })}
      </div>
    </div>
  );
};
