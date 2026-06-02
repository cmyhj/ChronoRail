import type { ParsedVersion } from '../types';
import type { MihoyoGameId } from '../utils/parser';

// 数据文件路径
const DATA_URL = '/ChronoRail/data/mihoyo-versions.json';

// 缓存数据
let cachedData: MihoyoData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface MihoyoVersion {
  version: string;
  name: string;
  startDate: string;
  endDate: string;
  title?: string;
}

interface MihoyoGameData {
  gameId: string;
  gameName: string;
  current: MihoyoVersion;
  history: MihoyoVersion[];
}

interface MihoyoData {
  fetchedAt: string;
  games: Record<string, MihoyoGameData>;
}

/**
 * 米哈游API服务
 */
export const mihoyoService = {
  /**
   * 获取游戏当前版本
   */
  async fetchCurrentVersion(gameId: MihoyoGameId): Promise<ParsedVersion | null> {
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
   * 获取游戏版本历史
   */
  async fetchVersionHistory(gameId: MihoyoGameId): Promise<MihoyoVersion[]> {
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
  async fetchAllGameData(): Promise<Record<string, MihoyoGameData>> {
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
  async fetchData(): Promise<MihoyoData> {
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
      console.error('Failed to fetch mihoyo data:', error);
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
  async checkAvailability(gameId: MihoyoGameId): Promise<boolean> {
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
  getSupportedGames(): Array<{ id: MihoyoGameId; name: string }> {
    return [
      { id: 'genshin', name: '原神' },
      { id: 'starrail', name: '崩坏：星穹铁道' },
      { id: 'zzz', name: '绝区零' },
    ];
  },
};
