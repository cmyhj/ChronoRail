import type { Banner } from '../types';
import dayjs from 'dayjs';

// 数据文件路径
const DATA_URL = '/ChronoRail/data/game-versions.json';

// 页面生命周期内只请求一次
let cachedData: GameData | null = null;

interface GameVersion {
  version: string;
  name: string;
  startDate: string;
  endDate: string;
  banners?: Banner[];
}

interface GameInfo {
  gameId: string;
  gameName: string;
  versions: GameVersion[];
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
   * 获取游戏卡池信息（当前版本 + 最近一个未来版本）
   */
  async fetchBanners(gameId: string): Promise<Banner[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      if (!gameData) return [];

      const today = dayjs().format('YYYY-MM-DD');
      const banners: Banner[] = [];

      // 当前版本：startDate ≤ today ≤ endDate
      const current = gameData.versions.find(v => v.startDate <= today && v.endDate >= today);
      if (current?.banners) {
        banners.push(...current.banners);
      }

      // 最近一个未来版本：startDate > today，取最小的
      const future = gameData.versions
        .filter(v => v.startDate > today)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
      if (future?.banners) {
        banners.push(...future.banners);
      }

      return banners;
    } catch {
      return [];
    }
  },

  /**
   * 获取游戏版本历史（所有版本，按开始日期降序）
   */
  async fetchVersionHistory(gameId: string): Promise<GameVersion[]> {
    try {
      const data = await this.fetchData();
      const gameData = data.games[gameId];
      if (!gameData) return [];

      return gameData.versions.filter(v => v.startDate).sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
      );
    } catch {
      return [];
    }
  },

  /**
   * 获取数据（带缓存，首次带时间戳破坏浏览器缓存）
   */
  async fetchData(): Promise<GameData> {
    if (cachedData) return cachedData;
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch data');
    cachedData = await response.json();
    return cachedData || { fetchedAt: '', games: {} };
  },
};
