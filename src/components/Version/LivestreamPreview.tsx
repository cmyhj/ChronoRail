import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import type { Game, Version } from '../../types';
import { formatLivestreamTime, formatRelativeLivestreamTime, livestreamStatus, parseLivestreamTime, safeOfficialUrl, selectLivestreamVersions } from '../../utils/livestream';

type PreviewGame = Pick<Game, 'id' | 'name'>;

export function LivestreamCard({ game, version, now, compact = false }: {
  game: PreviewGame;
  version?: Version;
  now: number;
  compact?: boolean;
}) {
  const livestream = version?.livestream;
  const status = livestreamStatus(livestream, now);
  const url = safeOfficialUrl(livestream?.officialUrl);
  const title = `${game.name} · ${version ? `v${livestream?.version ?? version.version} ${livestream?.name ?? (livestream?.version && livestream.version !== version.version ? '' : version.name)}` : '版本待公布'}`;
  return (
    <article className="bg-elevated/60 rounded-lg border border-line p-3 min-w-0">
      <h3 className="text-[13px] font-medium break-words">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {title}
          </a>
        ) : (
          <span className="text-fg">{title}</span>
        )}
      </h3>
      {compact ? (
        <p className="text-[12px] text-info mt-2 tabular-nums">
          {status.start !== null && <time dateTime={livestream?.startAt}>{formatRelativeLivestreamTime(status.start, now)}</time>}
        </p>
      ) : <>
      {version && livestream?.version && livestream.version !== version.version && (
        <p className="text-[12px] text-fg-3 mt-1">下版本前瞻（当前版本 v{version.version}）</p>
      )}
      <p className="text-[12px] text-info mt-2 tabular-nums">{status.text}</p>
      {status.start !== null && (
        <p className="text-[12px] text-fg-2 mt-1">
          开始：<time dateTime={livestream?.startAt}>{formatLivestreamTime(status.start)}</time>
        </p>
      )}
      {status.end !== null && (
        <p className="text-[12px] text-fg-2 mt-1">
          结束：<time dateTime={livestream?.endAt}>{formatLivestreamTime(status.end)}</time>
        </p>
      )}
      {livestream?.endAt && status.end === null && (
        <p className="text-[12px] text-fg-3 mt-1">结束时间无效或缺少有效开始时间，待核实</p>
      )}
      <div className="text-[12px] mt-2">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            官方直播 / 公告 ↗
          </a>
        ) : <span className="text-fg-3">{livestream?.officialUrl ? '官方链接无效，待核实' : '官方链接待公布'}</span>}
      </div>
      </>}
    </article>
  );
}

export function LivestreamPreview({ games, versions, scope = 'homepage' }: {
  games: PreviewGame[];
  versions: Version[];
  scope?: 'homepage' | 'detail';
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const upcoming = games.flatMap(game =>
    (scope === 'homepage'
      ? selectLivestreamVersions(versions, game.id, now)
      : versions.filter(version => version.gameId === game.id)
    ).map(version => ({ game, version }))
  );
  if (scope === 'homepage') {
    upcoming.sort((a, b) =>
      parseLivestreamTime(a.version.livestream?.startAt)! - parseLivestreamTime(b.version.livestream?.startAt)!
    );
  }

  return (
    <section aria-label="版本前瞻直播" className="bg-panel/50 backdrop-blur-xl rounded-xl border border-line p-4 mb-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold text-fg-2 mb-3">
        <Radio size={14} aria-hidden="true" />版本前瞻直播
      </h2>
      {upcoming.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {upcoming.map(({ game, version }) => (
            <LivestreamCard key={version.id} game={game} version={version} now={now} compact={scope === 'homepage'} />
          ))}
        </div>
      ) : <p className="text-[12px] text-fg-3">未来7天暂无已确认的前瞻直播</p>}
    </section>
  );
}
