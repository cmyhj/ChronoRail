import type { DataStore } from '../types';

// Identity tombstones only, not game configuration or display data. Fingerprints
// keep retired names/resources out of the shipped catalog while cleaning backups.
const retiredIdentities = new Set([
  '7e4f8caf4a7c56a8',
  'b1d2ede42659a669',
  '65280151936377dd',
]);

export function isRetiredIdentity(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.normalize('NFKC').toLowerCase().replace(/[\s_\-:：]/g, '');
  let hash = 0xcbf29ce484222325n;
  for (const char of normalized) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(char.codePointAt(0)!)) * 0x100000001b3n);
  }
  return retiredIdentities.has(hash.toString(16));
}

export function removeRetiredPresets(data: DataStore): DataStore {
  const removedIds = new Set(data.games.filter(game =>
    [game.id, game.name, game.icon].some(isRetiredIdentity)
  ).map(game => game.id));
  const games = data.games.filter(game => !removedIds.has(game.id));
  const versions = data.versions.filter(version =>
    !removedIds.has(version.gameId) && !isRetiredIdentity(version.gameId)
  );
  if (games.length === data.games.length && versions.length === data.versions.length) return data;
  return { ...data, games, versions };
}
