import type { ParsedVersion, MihoyoApiResponse } from '../types';

// 米哈游游戏配置
export const MIHOYO_GAMES = {
  genshin: {
    id: 'genshin',
    name: '原神',
    api: 'https://hk4e-ann-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList',
    versionPattern: /(\d+\.\d+)版本[「「](.+?)[」」]/,
    channelId: 150,
  },
  starrail: {
    id: 'starrail',
    name: '崩坏：星穹铁道',
    api: 'https://hkrpg-ann-api.mihoyo.com/common/hkrpg_cn/announcement/api/getAnnList',
    versionPattern: /(\d+\.\d+)版本[「「](.+?)[」」]/,
    channelId: 150,
  },
  zzz: {
    id: 'zzz',
    name: '绝区零',
    api: 'https://announcement-api.mihoyo.com/common/nap_cn/announcement/api/getAnnList',
    versionPattern: /(\d+\.\d+)版本[「「](.+?)[」」]/,
    channelId: 150,
  },
} as const;

export type MihoyoGameId = keyof typeof MIHOYO_GAMES;

/**
 * 从公告标题中解析版本信息
 * @param title 公告标题
 * @param pattern 版本匹配模式
 * @returns 解析后的版本信息
 */
export function parseVersionFromTitle(title: string, pattern: RegExp): ParsedVersion | null {
  const match = title.match(pattern);
  if (!match) return null;
  
  return {
    version: match[1],
    name: match[2],
    startDate: '', // 需要从其他字段获取
  };
}

/**
 * 从米哈游API响应中提取版本信息
 * @param response API响应
 * @param gameId 游戏ID
 * @returns 解析后的版本信息数组
 */
export function extractVersionsFromResponse(
  response: MihoyoApiResponse,
  gameId: MihoyoGameId
): ParsedVersion[] {
  const gameConfig = MIHOYO_GAMES[gameId];
  if (!gameConfig) return [];
  
  const versions: ParsedVersion[] = [];
  const seenVersions = new Set<string>();
  
  // 遍历所有公告类型
  for (const typeGroup of response.data.list) {
    for (const announcement of typeGroup.list) {
      const parsed = parseVersionFromTitle(announcement.title, gameConfig.versionPattern);
      
      if (parsed && !seenVersions.has(parsed.version)) {
        seenVersions.add(parsed.version);
        versions.push({
          ...parsed,
          startDate: announcement.start_time.split(' ')[0], // 只取日期部分
        });
      }
    }
  }
  
  // 按版本号排序
  return versions.sort((a, b) => {
    const aNum = parseFloat(a.version);
    const bNum = parseFloat(b.version);
    return bNum - aNum; // 降序
  });
}

/**
 * 获取米哈游游戏的当前版本
 * @param gameId 游戏ID
 * @returns 当前版本信息
 */
export async function fetchMihoyoCurrentVersion(gameId: MihoyoGameId): Promise<ParsedVersion | null> {
  const gameConfig = MIHOYO_GAMES[gameId];
  if (!gameConfig) return null;
  
  try {
    const response = await fetch(gameConfig.api);
    if (!response.ok) return null;
    
    const data: MihoyoApiResponse = await response.json();
    if (data.retcode !== 0) return null;
    
    const versions = extractVersionsFromResponse(data, gameId);
    return versions.length > 0 ? versions[0] : null;
  } catch (error) {
    console.error(`Failed to fetch version for ${gameId}:`, error);
    return null;
  }
}

/**
 * 获取游戏图标
 * @param gameId 游戏ID
 * @returns 图标标识或URL
 */
export function getGameIcon(gameId: string): string {
  // 预置游戏使用内置图标标识
  const presetIcons: Record<string, string> = {
    genshin: 'genshin',
    starrail: 'starrail',
    zzz: 'zzz',
  };
  
  return presetIcons[gameId] || 'default';
}

/**
 * 获取游戏主题色
 * @param gameId 游戏ID
 * @returns 主题色
 */
export function getGameColor(gameId: string): string {
  const presetColors: Record<string, string> = {
    genshin: '#4a90d9',
    starrail: '#e6a23c',
    zzz: '#67c23a',
  };
  
  return presetColors[gameId] || '#6366f1';
}
