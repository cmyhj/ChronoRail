import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => server.close());
const { storage, dataService, gameService } = await server.ssrLoadModule('/src/services/storage.ts');
const { isRetiredIdentity, removeRetiredPresets } = await server.ssrLoadModule('/src/utils/retiredPresets.ts');
const { githubService } = await server.ssrLoadModule('/src/services/github.ts');
const { mihoyoService } = await server.ssrLoadModule('/src/services/mihoyo.ts');
const { GAME_CONFIGS } = await server.ssrLoadModule('/src/utils/parser.ts');

// Migration-only fixtures use code points: retired catalog strings must not ship.
const legacyId = String.fromCodePoint(100, 111, 117, 98, 108, 101, 104, 101, 108, 105, 120);
const legacyName = String.fromCodePoint(20108, 37325, 34746, 26059);
const legacyEnglish = String.fromCodePoint(68, 117, 101, 116, 32, 78, 105, 103, 104, 116, 32, 65, 98, 121, 115, 115);
const keep = { id: 'custom', name: '自定义游戏', icon: 'default', autoFetch: true };
const version = gameId => ({ id: `v-${gameId}`, gameId, version: '1.0' });
const fixture = () => ({
  games: [keep, { id: legacyId, name: legacyName },
    { id: 'renamed', name: legacyEnglish }, { id: 'by-icon', name: '旧记录', icon: legacyId }],
  versions: ['custom', legacyId, 'renamed', 'by-icon'].map(version),
  lastUpdated: '2000-01-01', version: 1,
});
const store = new Map();
beforeEach(() => {
  store.clear();
  globalThis.localStorage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
  };
});
const check = data => {
  assert.deepEqual(data.games, [keep]);
  assert.deepEqual(data.versions, [version('custom')]);
};

test('retired identities match normalized aliases, unrelated custom games survive', () => {
  for (const value of [legacyId, legacyName, legacyEnglish, ` ${legacyId.toUpperCase()} `]) {
    assert.equal(isRetiredIdentity(value), true);
  }
  for (const value of [undefined, '', 'custom', ...Object.keys(GAME_CONFIGS)]) {
    assert.equal(isRetiredIdentity(value), false);
  }
  check(removeRetiredPresets(fixture()));
  const source = fixture();
  removeRetiredPresets(source);
  assert.equal(source.games.length, 4, 'no mutation');
});

test('existing localStorage is cleaned and persisted on first read, idempotently', () => {
  store.set('chronorail_data', JSON.stringify(fixture()));
  check(storage.getData());
  check(JSON.parse(store.get('chronorail_data')));
  const saved = store.get('chronorail_data');
  check(storage.getData());
  assert.equal(store.get('chronorail_data'), saved);
});

test('old schema migration also drops retired data and linked versions', () => {
  store.set('chronorail_data', JSON.stringify({ ...fixture(), version: 0 }));
  check(storage.getData());
  assert.equal(storage.getData().version, 1);
  check(storage.migrateData(fixture()));
});

test('JSON imports, exports and direct saves cannot restore retired records', () => {
  assert.equal(dataService.importFromJson(JSON.stringify(fixture())), true);
  check(JSON.parse(dataService.exportToJson()));
  storage.saveData(fixture());
  check(JSON.parse(store.get('chronorail_data')));
  storage.saveData({ ...fixture(), games: [keep] });
  assert.deepEqual(storage.getData().versions.map(v => v.gameId), ['custom', 'renamed', 'by-icon']);
  // The retired canonical ID is dropped even without a game record; unrelated
  // orphan records are deliberately preserved rather than guessed to be retired.
});

test('game mutations cannot persist removed identities', () => {
  storage.saveData({ ...fixture(), games: [keep], versions: [version('custom')] });
  gameService.add({ id: legacyId, name: legacyName });
  check(storage.getData());
  gameService.update('custom', { name: legacyEnglish });
  assert.deepEqual(storage.getData().games, []);
  assert.deepEqual(storage.getData().versions, []);
});

test('GitHub pull uses the same sanitization, with no network or remote writes', async () => {
  const original = githubService.getFile;
  try {
    storage.saveGitHubConfig({ token: 'fixture', owner: 'fixture', repo: 'fixture', path: 'fixture.json' });
    githubService.getFile = async () => ({ content: JSON.stringify(fixture()), sha: 'fixture' });
    assert.equal(await githubService.syncFromGitHub(), true);
    check(storage.getData());
  } finally {
    githubService.getFile = original;
  }
});

test('stale remote catalogs are filtered before caching or timeline merge', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ games: {
      [legacyId]: { gameId: legacyId, gameName: legacyName, versions: [] },
      alias: { gameId: 'alias', gameName: legacyEnglish, versions: [] },
      custom: { gameId: 'custom', gameName: keep.name, versions: [] },
    } }) });
    assert.deepEqual(Object.keys((await mihoyoService.fetchData()).games), ['custom']);
    assert.deepEqual(await mihoyoService.fetchVersionHistory(legacyId), []);
    assert.deepEqual(await mihoyoService.fetchBanners(legacyId), []);
  } finally {
    globalThis.fetch = original;
  }
});

test('production catalog has eight presets and no retired records or resources', async () => {
  const catalog = JSON.parse(await readFile('public/data/game-versions.json', 'utf8'));
  assert.equal(Object.keys(GAME_CONFIGS).length, 8);
  assert.deepEqual(Object.keys(catalog.games).sort(), Object.keys(GAME_CONFIGS).sort());
  for (const file of ['public/data/game-versions.json', 'public/data/chronorail.json',
    'src/components/Common/gameData.tsx', 'docs/livestream-sources.md']) {
    const text = await readFile(file, 'utf8');
    for (const value of [legacyId, legacyName, legacyEnglish]) {
      assert.equal(text.toLowerCase().includes(value.toLowerCase()), false, file);
    }
  }
});
