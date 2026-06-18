import type { Banner } from '../types';

// 数据文件路径
const DATA_URL = '/ChronoRail/data/game-versions.json';

// 缓存数据
let cachedData: GameData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface GameVersion {
  version: string;
  name: string;
  startDate: string;
  endDate: string;
  banners?: Banner[];
}

interface NextVersion extends GameVersion {
  banners: Banner[];
}

interface GameInfo {
  gameId: string;
  gameName: string;
  current: GameVersion;
  banners: Banner[];
  nextVersion?: NextVersion;
  history: GameVersion[];
}

interface GameData {
  fetchedAt: string;
  games: Record<string, GameInfo>;
}

/**
 * 游戏数据服务
 */
export const mihoyoService = {
  /**
   * 获取游戏卡池信息（当前版本 + 下一版本）
   */
  async fetchBanners(gameId: string): Promise<Banner[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      if (!gameData) return [];
      
      const banners: Banner[] = [...(gameData.banners || [])];
      
      // 添加下一版本的卡池
      if (gameData.nextVersion?.banners) {
        banners.push(...gameData.nextVersion.banners);
      }
      
      return banners;
    } catch {
      return [];
    }
  },

  /**
   * 获取游戏版本历史（包含卡池信息）
   */
  async fetchVersionHistory(gameId: string): Promise<GameVersion[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      if (!gameData) return [];
      
      const history = [...(gameData.history || [])];
      
      if (gameData.nextVersion) {
        const exists = history.some(v => v.version === gameData.nextVersion!.version);
        if (!exists) {
          history.unshift(gameData.nextVersion);
        }
      }
      
      return history;
    } catch {
      return [];
    }
  },

  /**
   * 获取数据（带缓存）
   */
  async fetchData(): Promise<GameData> {
    const now = Date.now();
    
    // 使用缓存
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedData;
    }
    
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      cachedData = await response.json();
      lastFetchTime = now;
      return cachedData || { fetchedAt: '', games: {} };
    } catch {
      return cachedData || { fetchedAt: '', games: {} };
    }
  },
};
