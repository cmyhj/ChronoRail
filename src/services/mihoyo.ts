import type { MihoyoApiResponse, ParsedVersion } from '../types';
import { MIHOYO_GAMES, extractVersionsFromResponse } from '../utils/parser';
import type { MihoyoGameId } from '../utils/parser';

// CORS代理地址（用于解决跨域问题）
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * 米哈游API服务
 */
export const mihoyoService = {
  /**
   * 获取游戏版本列表
   */
  async fetchVersions(gameId: MihoyoGameId): Promise<ParsedVersion[]> {
    const gameConfig = MIHOYO_GAMES[gameId];
    if (!gameConfig) return [];

    try {
      // 使用CORS代理
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(gameConfig.api)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) return [];

      const data: MihoyoApiResponse = await response.json();
      if (data.retcode !== 0) return [];

      return extractVersionsFromResponse(data, gameId);
    } catch (error) {
      console.error(`Failed to fetch versions for ${gameId}:`, error);
      return [];
    }
  },

  /**
   * 获取当前版本
   */
  async fetchCurrentVersion(gameId: MihoyoGameId): Promise<ParsedVersion | null> {
    const versions = await this.fetchVersions(gameId);
    return versions.length > 0 ? versions[0] : null;
  },

  /**
   * 检查API是否可用
   */
  async checkAvailability(gameId: MihoyoGameId): Promise<boolean> {
    const gameConfig = MIHOYO_GAMES[gameId];
    if (!gameConfig) return false;

    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(gameConfig.api)}`;
      const response = await fetch(proxyUrl, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * 获取所有支持的游戏列表
   */
  getSupportedGames(): Array<{ id: MihoyoGameId; name: string }> {
    return Object.entries(MIHOYO_GAMES).map(([id, config]) => ({
      id: id as MihoyoGameId,
      name: config.name,
    }));
  },
};
