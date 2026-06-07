import type { ParsedVersion } from '../types';

// 数据文件路径
const DATA_URL = '/ChronoRail/data/game-versions.json';

// 缓存数据
let cachedData: GameData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface Banner {
  name: string;
  character: string;
  startDate: string;
  endDate: string;
}

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
   * 清除缓存，强制下次获取新数据
   */
  clearCache(): void {
    cachedData = null;
    lastFetchTime = 0;
  },

  /**
   * 获取游戏当前版本
   */
  async fetchCurrentVersion(gameId: string): Promise<ParsedVersion | null> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      if (!gameData?.current) return null;
      
      return {
        version: gameData.current.version,
        name: gameData.current.name,
        startDate: gameData.current.startDate,
      };
    } catch (error) {
      console.error(`Failed to fetch version for ${gameId}:`, error);
      return null;
    }
  },

  /**
   * 获取游戏卡池信息（当前版本）
   */
  async fetchBanners(gameId: string): Promise<Banner[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      return gameData?.banners || [];
    } catch (error) {
      console.error(`Failed to fetch banners for ${gameId}:`, error);
      return [];
    }
  },

  /**
   * 获取游戏下一版本信息
   */
  async fetchNextVersion(gameId: string): Promise<NextVersion | null> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      return gameData?.nextVersion || null;
    } catch (error) {
      console.error(`Failed to fetch next version for ${gameId}:`, error);
      return null;
    }
  },

  /**
   * 获取游戏版本历史（包含卡池信息）
   */
  async fetchVersionHistory(gameId: string): Promise<GameVersion[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      
      return gameData?.history || [];
    } catch (error) {
      console.error(`Failed to fetch history for ${gameId}:`, error);
      return [];
    }
  },

  /**
   * 获取所有游戏的版本数据
   */
  async fetchAllGameData(): Promise<Record<string, GameInfo>> {
    try {
      const data = await this.fetchData();
      return data.games;
    } catch (error) {
      console.error('Failed to fetch all game data:', error);
      return {};
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
    } catch (error) {
      console.error('Failed to fetch game data:', error);
      return cachedData || { fetchedAt: '', games: {} };
    }
  },

  /**
   * 获取数据更新时间
   */
  async getFetchedAt(): Promise<string | null> {
    try {
      const data = await this.fetchData();
      return data.fetchedAt;
    } catch {
      return null;
    }
  },

  /**
   * 检查API是否可用
   */
  async checkAvailability(gameId: string): Promise<boolean> {
    try {
      const data = await this.fetchData();
      return !!data.games[gameId];
    } catch {
      return false;
    }
  },

  /**
   * 获取所有支持的游戏列表
   */
  getSupportedGames(): Array<{ id: string; name: string }> {
    return [
      { id: 'genshin', name: '原神' },
      { id: 'starrail', name: '崩坏：星穹铁道' },
      { id: 'zzz', name: '绝区零' },
      { id: 'wutheringwaves', name: '鸣潮' },
      { id: 'arknights', name: '明日方舟' },
      { id: 'reverse1999', name: '重返未来:1999' },
      { id: 'arknights_endfield', name: '明日方舟:终末地' },
      { id: 'yihuan', name: '异环' },
      { id: 'doublehelix', name: '二重螺旋' },
    ];
  },
};
