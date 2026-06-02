import type { ParsedVersion } from '../types';
import type { MihoyoGameId } from '../utils/parser';

// 数据文件路径（相对于base URL）
const DATA_URL = '/ChronoRail/data/mihoyo-versions.json';

// 缓存数据
let cachedData: Record<string, any> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 米哈游API服务
 */
export const mihoyoService = {
  /**
   * 获取游戏版本列表
   */
  async fetchVersions(gameId: MihoyoGameId): Promise<ParsedVersion[]> {
    const currentVersion = await this.fetchCurrentVersion(gameId);
    return currentVersion ? [currentVersion] : [];
  },

  /**
   * 获取当前版本
   */
  async fetchCurrentVersion(gameId: MihoyoGameId): Promise<ParsedVersion | null> {
    try {
      const data = await this.fetchData();
      const gameData = data[gameId];
      
      if (!gameData) return null;
      
      return {
        version: gameData.version,
        name: gameData.name,
        startDate: gameData.startDate,
      };
    } catch (error) {
      console.error(`Failed to fetch version for ${gameId}:`, error);
      return null;
    }
  },

  /**
   * 获取数据（带缓存）
   */
  async fetchData(): Promise<Record<string, any>> {
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
      return cachedData || {};
    } catch (error) {
      console.error('Failed to fetch mihoyo data:', error);
      return cachedData || {};
    }
  },

  /**
   * 检查API是否可用
   */
  async checkAvailability(gameId: MihoyoGameId): Promise<boolean> {
    try {
      const data = await this.fetchData();
      return !!data[gameId];
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
