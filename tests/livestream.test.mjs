import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

// Synthetic announcements and URLs live only in this test, never production data.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => server.close());
const { parseLivestreamTime: parse, safeOfficialUrl: safe, livestreamStatus: status,
  formatLivestreamTime: format, formatRelativeLivestreamTime: relative, selectLivestreamVersions: select } =
  await server.ssrLoadModule('/src/utils/livestream.ts');
const { LivestreamCard, LivestreamPreview } =
  await server.ssrLoadModule('/src/components/Version/LivestreamPreview.tsx');
const now = Date.parse('2030-05-01T12:00:00Z');
const game = { id: 'fixture', name: '测试游戏' };
const fixture = {
  id: 'fixture-version', gameId: game.id, version: '9.9', name: '测试版本',
  startDate: '2030-05-10', isAutoFetched: false, createdAt: '', updatedAt: '',
  livestream: { startAt: '2030-05-01T21:00:00+08:00', endAt: '2030-05-01T22:00:00+08:00',
    officialUrl: 'https://example.com/fixture-announcement' },
};
const render = (livestream, clock = now) => renderToStaticMarkup(
  React.createElement(LivestreamCard, { game, version: { ...fixture, livestream }, now: clock })
);

test('future countdown, exact start/end boundaries, and positive subsecond countdown', () => {
  assert.equal(status(fixture.livestream, now).text, '距直播 0天 1小时 0分 0秒');
  const start = parse(fixture.livestream.startAt);
  const end = parse(fixture.livestream.endAt);
  assert.equal(status(fixture.livestream, start - 1).text, '距直播 0天 0小时 0分 1秒');
  assert.equal(status(fixture.livestream, start).text, '直播已开始');
  assert.equal(status(fixture.livestream, end - 1).text, '直播已开始');
  assert.equal(status(fixture.livestream, end).text, '直播已结束');
});

test('missing end never asserts ended, even long after start', () => {
  const live = { startAt: fixture.livestream.startAt };
  assert.equal(status(live, now + 365 * 86400000).text, '直播已开始（结束时间未确认）');
  assert.doesNotMatch(render(live, now + 365 * 86400000), /直播已结束/);
});

test('old data, empty metadata and unknown start are honest pending states', () => {
  for (const live of [undefined, {}, { endAt: fixture.livestream.endAt }]) {
    assert.equal(status(live, now).text, '直播时间待公布');
    assert.match(render(live), /直播时间待公布/);
  }
  assert.match(renderToStaticMarkup(React.createElement(LivestreamCard, { game, now })), /版本待公布/);
});

test('strict ISO validation rejects rollover, ambiguous local time and malformed values', () => {
  for (const value of [null, 123, '', '2030-05-01', '2030-05-01T21:00:00',
    '2030-02-29T12:00:00Z', '2032-02-30T12:00:00Z', '2030-04-31T12:00:00Z',
    '2030-00-01T00:00:00Z', '2030-13-01T00:00:00Z', '2030-01-00T00:00:00Z',
    '2030-01-01T24:00:00Z', '2030-01-01T12:60:00Z', '2030-01-01T12:00:60Z',
    '2030-01-01T12:00:00+14:01', '2030-01-01T12:00:00+08:60',
    '2030-01-01T12:00:00-00:00', ' 2030-01-01T12:00:00Z']) {
    assert.equal(parse(value), null, String(value));
  }
  assert.notEqual(parse('2032-02-29T12:00:00Z'), null);
  assert.notEqual(parse('2000-02-29T12:00:00.123Z'), null);
  assert.equal(parse('2100-02-29T12:00:00Z'), null);
});

test('timezone offsets represent equal instants and display explicit Beijing timezone', () => {
  assert.equal(parse('2030-05-01T21:00:00+08:00'), parse('2030-05-01T13:00:00Z'));
  assert.equal(parse('2030-05-01T08:00:00-05:00'), parse('2030-05-01T13:00:00Z'));
  assert.equal(parse('2030-05-02T00:30:00+08:00'), parse('2030-05-01T16:30:00Z'));
  assert.match(format(now), /20:00:00.*北京时间 UTC\+08:00/);
});

test('invalid start/end and reversed end cannot falsely assert ended', () => {
  assert.match(render({ startAt: '2030-02-30T12:00:00Z' }), /直播时间无效，待核实/);
  for (const endAt of ['bad', '2030-02-30T12:00:00Z', fixture.livestream.startAt,
    '2030-01-01T00:00:00Z']) {
    const live = { startAt: fixture.livestream.startAt, endAt };
    assert.equal(status(live, now + 86400000).text, '直播已开始（结束时间未确认）');
    assert.match(render(live, now + 86400000), /结束时间无效/);
  }
});

test('only absolute HTTP(S) URLs without credentials or parser ambiguities are links', () => {
  for (const value of [undefined, '', 'javascript:alert(1)', 'data:text/html,test', 'ftp://example.com',
    '//example.com', '/relative', 'https://', 'https://user:password@example.com',
    'https://example.com\n.evil.test', 'https://example.com\\@evil.test', ' https://example.com']) {
    assert.equal(safe(value), null, String(value));
    assert.doesNotMatch(render({ officialUrl: value }), /<a /);
  }
  assert.equal(safe('http://example.com/path'), 'http://example.com/path');
  assert.match(render(fixture.livestream), /href="https:\/\/example.com\/fixture-announcement"/);
  assert.match(render(fixture.livestream), /rel="noopener noreferrer"/);
  assert.match(render(fixture.livestream), /target="_blank"/);
});

test('React renders game/version, timezone, timestamps, countdown and ended state', () => {
  const html = render(fixture.livestream);
  for (const text of ['测试游戏', 'v9.9 测试版本', '北京时间 UTC+08:00', '距直播', '官方直播 / 公告']) {
    assert.ok(html.includes(text), text);
  }
  assert.match(html, /dateTime="2030-05-01T21:00:00\+08:00"/i);
  assert.match(render(fixture.livestream, now + 86400000), /直播已结束/);
});

const week = 7 * 24 * 60 * 60 * 1000;
const at = (id, timestamp) => ({
  ...fixture, id, name: id, livestream: { startAt: new Date(timestamp).toISOString() },
});
const renderPreview = (games, versions, clock = now) => {
  const originalNow = Date.now;
  try {
    Date.now = () => clock;
    return renderToStaticMarkup(React.createElement(LivestreamPreview, { games, versions }));
  } finally {
    Date.now = originalNow;
  }
};

test('relative Beijing dates use calendar days, Monday weeks, and 24-hour minutes', () => {
  const clock = parse('2026-10-27T23:55:00+08:00'); // Tuesday
  for (const [startAt, label] of [
    ['2026-10-27T23:59:00+08:00', '今天23:59'],
    ['2026-10-28T00:05:00+08:00', '明天00:05'],
    ['2026-10-29T19:30:00+08:00', '后天19:30'],
    ['2026-10-30T19:30:00+08:00', '周五19:30'],
    ['2026-11-01T19:30:00+08:00', '周日19:30'],
    ['2026-11-02T19:30:00+08:00', '下周一19:30'],
    ['2026-11-03T19:30:00+08:00', '下周二19:30'],
    ['2026-10-27T16:05:00Z', '明天00:05'],
    ['2026-11-02T11:30:00Z', '下周一19:30'],
  ]) {
    assert.equal(relative(parse(startAt), clock), label, startAt);
  }
  // Today/tomorrow/day-after take precedence even across week/year boundaries.
  assert.equal(relative(parse('2026-11-02T00:05:00+08:00'), parse('2026-11-01T23:55:00+08:00')), '明天00:05');
  assert.equal(relative(parse('2027-01-01T00:05:00+08:00'), parse('2026-12-30T23:55:00+08:00')), '后天00:05');
});

test('homepage cards have exactly the unchanged title and relative time, detail stays complete', () => {
  const version = { ...fixture, livestream: { ...fixture.livestream, version: '10.0', name: '下一版本' } };
  const html = renderPreview([game], [version]);
  const card = html.match(/<article[^>]*>(.*?)<\/article>/s)?.[1];
  assert.ok(card);
  assert.match(card, /^<h3[^>]*>测试游戏 · v10\.0 下一版本<\/h3><p[^>]*><time[^>]*>今天21:00<\/time><\/p>$/);
  assert.doesNotMatch(card, /下版本前瞻|当前版本|距直播|开始：|结束：|北京时间|UTC|官方|<a /);
  const detail = render({ ...fixture.livestream, version: '10.0', name: '下一版本' });
  assert.match(detail, /下版本前瞻/);
  assert.match(detail, /北京时间/);
  assert.match(detail, /官方直播/);
});

test('homepage selection includes exact now and day 7, excludes past and day 7 + 1ms', () => {
  const cases = [
    [-1, false], [0, true], [1, true], [week - 1, true], [week, true], [week + 1, false],
  ];
  for (const [offset, included] of cases) {
    const version = at(`boundary-${offset}`, now + offset);
    assert.equal(select([version], game.id, now).length, included ? 1 : 0, String(offset));
    const html = renderPreview([game], [version]);
    assert.equal(html.includes('<article'), included, `render ${offset}`);
    assert.equal(html.includes('未来7天暂无已确认的前瞻直播'), !included);
  }
});

test('homepage hides missing/invalid starts and other games without pending placeholder cards', () => {
  const excluded = [undefined, {}, { endAt: fixture.livestream.endAt },
    { startAt: '' }, { startAt: 'bad' }, { startAt: '2030-02-30T12:00:00Z' },
    { startAt: '2030-05-01T21:00:00' }].map((livestream, i) => ({
      ...fixture, id: `missing-${i}`, livestream,
    }));
  excluded.push({ ...fixture, gameId: 'other' });
  assert.deepEqual(select(excluded, game.id, now), []);
  for (const games of [[], [game]]) {
    const html = renderPreview(games, excluded);
    assert.match(html, /未来7天暂无已确认的前瞻直播/);
    assert.doesNotMatch(html, /<article|直播时间待公布|版本待公布/);
  }
});

test('selection keeps eligible older versions, timezone equivalents, and does not mutate source', () => {
  const latest = { ...fixture, id: 'new', startDate: '2030-06-01', livestream: undefined };
  const old = { ...fixture, id: 'old', startDate: '2030-01-01' };
  const source = [old, fixture, latest];
  assert.deepEqual(select(source, game.id, now).map(v => v.id), [fixture.id, 'old']);
  assert.deepEqual(source.map(v => v.id), ['old', fixture.id, 'new']);
  for (const startAt of ['2030-05-08T20:00:00+08:00', '2030-05-08T12:00:00Z']) {
    assert.equal(select([{ ...fixture, livestream: { startAt } }], game.id, now).length, 1);
  }
  const html = renderPreview([game], source);
  assert.equal((html.match(/<article/g) || []).length, 2);
  assert.doesNotMatch(html, /直播时间待公布|未来7天暂无/);
});

test('homepage re-evaluates the time window while standalone detail cards remain unfiltered', () => {
  const version = at('clock-boundary', now + week + 1);
  assert.doesNotMatch(renderPreview([game], [version], now), /<article/);
  assert.match(renderPreview([game], [version], now + 1), /<article/);
  assert.match(renderPreview([game], [version], now + week + 1), /<article/);
  assert.doesNotMatch(renderPreview([game], [version], now + week + 2), /<article/);
  assert.match(render(undefined), /直播时间待公布/);
  assert.match(render(fixture.livestream, now + week), /直播已结束/);
});

test('detail scope preserves unknown, past and distant livestream records', () => {
  for (const livestream of [undefined, fixture.livestream,
    { startAt: '2000-01-01T00:00:00Z' }, { startAt: '2100-01-01T00:00:00Z' }]) {
    const html = renderToStaticMarkup(React.createElement(LivestreamPreview, {
      games: [game], versions: [{ ...fixture, livestream }], scope: 'detail',
    }));
    assert.match(html, /<article/);
    assert.doesNotMatch(html, /未来7天暂无/);
  }
});

test('data service carries optional metadata through history fetch (fixture only)', async () => {
  const { mihoyoService } = await server.ssrLoadModule('/src/services/mihoyo.ts');
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ games: {
      fixture: { versions: [fixture, { ...fixture, version: '9.8', livestream: undefined }] },
    } }) });
    const history = await mihoyoService.fetchVersionHistory('fixture');
    assert.deepEqual(history[0].livestream, fixture.livestream);
    assert.equal(history[1].livestream, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('confirmed production previews render announced versions without changing release records', async () => {
  const data = JSON.parse(await readFile('public/data/game-versions.json', 'utf8'));
  const clock = Date.parse('2026-10-27T12:00:00+08:00');
  for (const [id, current, next, title, startAt] of [
    ['starrail', '4.6', '4.7', '此刻，将群星付之一笑', '2026-10-30T19:30:00+08:00'],
    ['yihuan', '1.4', '1.5', '致电，空想迷数', '2026-10-28T19:30:00+08:00'],
  ]) {
    const info = data.games[id];
    const record = info.versions[0];
    assert.equal(record.version, current);
    assert.equal(record.livestream?.version, next);
    assert.equal(record.livestream?.name, title);
    assert.equal(record.livestream?.startAt, startAt);
    assert.equal(record.livestream?.endAt, undefined);
    assert.ok(!info.versions.some(v => v.version === next), 'no invented release date');
    const version = { ...record, gameId: id, id: `${id}-${current}` };
    const html = renderPreview([{ id, name: info.gameName }], [version], clock);
    assert.match(html, new RegExp(`v${next.replace('.', '\\.')} ${title}`));
    assert.doesNotMatch(html, new RegExp(`v${current.replace('.', '\\.')} `));
    const detail = renderToStaticMarkup(React.createElement(LivestreamPreview, {
      games: [{ id, name: info.gameName }], versions: [version], scope: 'detail',
    }));
    assert.ok(detail.includes(`v${next} ${title}`));
    assert.match(detail, /下版本前瞻/);
    assert.ok(detail.includes(`当前版本 v${current}`));
  }
});

test('production JSON contains no synthetic livestream fixture', async () => {
  for (const file of ['public/data/game-versions.json', 'public/data/chronorail.json']) {
    const data = await readFile(file, 'utf8');
    assert.doesNotMatch(data, /fixture-announcement|测试游戏|测试版本/);
    assert.doesNotThrow(() => JSON.parse(data));
  }
});

test('production records obey the homepage window without requiring pending placeholders', async () => {
  const data = JSON.parse(await readFile('public/data/game-versions.json', 'utf8'));
  const clock = Date.now();
  for (const info of Object.values(data.games)) {
    const versions = info.versions.map(v => ({ ...v, gameId: info.gameId, id: `${info.gameId}-${v.version}` }));
    const expected = versions.filter(v => {
      const start = parse(v.livestream?.startAt);
      return start !== null && start >= clock && start <= clock + week;
    });
    const html = renderPreview([{ id: info.gameId, name: info.gameName }], versions, clock);
    assert.equal((html.match(/<article/g) || []).length, expected.length);
    assert.equal(html.includes('未来7天暂无已确认的前瞻直播'), expected.length === 0);
    assert.doesNotMatch(html, /直播时间待公布|版本待公布/);
  }
});
