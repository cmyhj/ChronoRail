import type { ParsedVersion, MihoyoApiResponse } from '../types';

// 游戏配置接口
export interface GameConfig {
  id: string;
  name: string;
  api?: string;
  versionPattern?: RegExp;
  autoFetch: boolean;
  color: string;
  icon: string;
}

// 所有支持的游戏配置
export const GAME_CONFIGS: Record<string, GameConfig> = {
  // 米哈游游戏
  genshin: {
    id: 'genshin',
    name: '原神',
    autoFetch: true,
    color: '#4a90d9',
    icon: 'genshin',
  },
  starrail: {
    id: 'starrail',
    name: '崩坏：星穹铁道',
    autoFetch: true,
    color: '#e6a23c',
    icon: 'starrail',
  },
  zzz: {
    id: 'zzz',
    name: '绝区零',
    autoFetch: true,
    color: '#67c23a',
    icon: 'zzz',
  },
  // 库洛游戏
  wutheringwaves: {
    id: 'wutheringwaves',
    name: '鸣潮',
    autoFetch: true,
    color: '#00b4d8',
    icon: 'wutheringwaves',
  },
  // 鹰角网络
  arknights: {
    id: 'arknights',
    name: '明日方舟',
    autoFetch: true,
    color: '#f4845f',
    icon: 'arknights',
  },
  // 深蓝互动
  reverse1999: {
    id: 'reverse1999',
    name: '重返未来:1999',
    autoFetch: true,
    color: '#7c3aed',
    icon: 'reverse1999',
  },
  // 鹰角网络 - 终末地
  arknights_endfield: {
    id: 'arknights_endfield',
    name: '明日方舟:终末地',
    autoFetch: true,
    color: '#f97316',
    icon: 'arknights_endfield',
  },
  // 异环
  yihuan: {
    id: 'yihuan',
    name: '异环',
    autoFetch: true,
    color: '#14b8a6',
    icon: 'yihuan',
  },
  // 二重螺旋
  doublehelix: {
    id: 'doublehelix',
    name: '二重螺旋',
    autoFetch: true,
    color: '#ec4899',
    icon: 'doublehelix',
  },
};

// 米哈游游戏ID类型
export type MihoyoGameId = 'genshin' | 'starrail' | 'zzz';

// 所有游戏ID类型
export type GameId = keyof typeof GAME_CONFIGS;

/**
 * 获取游戏配置
 */
export function getGameConfig(gameId: string): GameConfig | undefined {
  return GAME_CONFIGS[gameId];
}

/**
 * 获取所有预置游戏列表
 */
export function getPresetGames(): GameConfig[] {
  return Object.values(GAME_CONFIGS);
}

/**
 * 从公告标题中解析版本信息
 */
export function parseVersionFromTitle(title: string, pattern: RegExp): ParsedVersion | null {
  const match = title.match(pattern);
  if (!match) return null;
  
  return {
    version: match[1],
    name: match[2],
    startDate: '',
  };
}

/**
 * 从米哈游API响应中提取版本信息
 */
export function extractVersionsFromResponse(
  response: MihoyoApiResponse,
  gameId: MihoyoGameId
): ParsedVersion[] {
  const gameConfig = GAME_CONFIGS[gameId];
  if (!gameConfig?.api || !gameConfig?.versionPattern) return [];
  
  const versions: ParsedVersion[] = [];
  const seenVersions = new Set<string>();
  
  for (const typeGroup of response.data.list) {
    for (const announcement of typeGroup.list) {
      const parsed = parseVersionFromTitle(announcement.title, gameConfig.versionPattern);
      
      if (parsed && !seenVersions.has(parsed.version)) {
        seenVersions.add(parsed.version);
        versions.push({
          ...parsed,
          startDate: announcement.start_time.split(' ')[0],
        });
      }
    }
  }
  
  return versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
}

/**
 * 获取游戏图标
 */
export function getGameIcon(gameId: string): string {
  const config = GAME_CONFIGS[gameId];
  return config?.icon || 'default';
}

/**
 * 获取游戏主题色
 */
export function getGameColor(gameId: string): string {
  const config = GAME_CONFIGS[gameId];
  return config?.color || '#6366f1';
}
