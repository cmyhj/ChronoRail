import type { DataStore, Game, Version, GitHubConfig } from '../types';
import { generateId, getCurrentTimestamp } from '../utils/date';

const STORAGE_KEY = 'chronorail_data';
const GITHUB_CONFIG_KEY = 'chronorail_github_config';
const DATA_VERSION = 1;

// 默认数据
const defaultData: DataStore = {
  games: [],
  versions: [],
  lastUpdated: getCurrentTimestamp(),
  version: DATA_VERSION,
};

/**
 * 本地存储服务
 */
export const storage = {
  /**
   * 获取数据
   */
  getData(): DataStore {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { ...defaultData };
      
      const parsed = JSON.parse(data) as DataStore;
      // 数据版本迁移
      if (parsed.version !== DATA_VERSION) {
        return this.migrateData(parsed);
      }
      return parsed;
    } catch (error) {
      console.error('Failed to get data from storage:', error);
      return { ...defaultData };
    }
  },

  /**
   * 保存数据
   */
  saveData(data: DataStore): void {
    try {
      const updated = {
        ...data,
        lastUpdated: getCurrentTimestamp(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  },

  /**
   * 数据迁移
   */
  migrateData(oldData: Partial<DataStore>): DataStore {
    // 这里可以添加数据迁移逻辑
    return {
      games: oldData.games || [],
      versions: oldData.versions || [],
      lastUpdated: getCurrentTimestamp(),
      version: DATA_VERSION,
    };
  },

  /**
   * 清除数据
   */
  clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * 获取GitHub配置
   */
  getGitHubConfig(): GitHubConfig | null {
    try {
      const config = localStorage.getItem(GITHUB_CONFIG_KEY);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * 保存GitHub配置
   */
  saveGitHubConfig(config: GitHubConfig): void {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  },

  /**
   * 清除GitHub配置
   */
  clearGitHubConfig(): void {
    localStorage.removeItem(GITHUB_CONFIG_KEY);
  },
};

/**
 * 游戏数据操作
 */
export const gameService = {
  /**
   * 获取所有游戏
   */
  getAll(): Game[] {
    return storage.getData().games;
  },

  /**
   * 根据ID获取游戏
   */
  getById(id: string): Game | undefined {
    return storage.getData().games.find(g => g.id === id);
  },

  /**
   * 添加游戏
   */
  add(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Game {
    const data = storage.getData();
    const newGame: Game = {
      ...gameData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    
    data.games.push(newGame);
    storage.saveData(data);
    return newGame;
  },

  /**
   * 更新游戏
   */
  update(id: string, updates: Partial<Game>): Game | null {
    const data = storage.getData();
    const index = data.games.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    data.games[index] = {
      ...data.games[index],
      ...updates,
      updatedAt: getCurrentTimestamp(),
    };
    
    storage.saveData(data);
    return data.games[index];
  },

  /**
   * 删除游戏
   */
  delete(id: string): boolean {
    const data = storage.getData();
    const index = data.games.findIndex(g => g.id === id);
    
    if (index === -1) return false;
    
    data.games.splice(index, 1);
    // 同时删除该游戏的所有版本
    data.versions = data.versions.filter(v => v.gameId !== id);
    
    storage.saveData(data);
    return true;
  },
};

/**
 * 版本数据操作
 */
export const versionService = {
  /**
   * 获取所有版本
   */
  getAll(): Version[] {
    return storage.getData().versions;
  },

  /**
   * 根据游戏ID获取版本
   */
  getByGameId(gameId: string): Version[] {
    return storage.getData().versions
      .filter(v => v.gameId === gameId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  },

  /**
   * 根据ID获取版本
   */
  getById(id: string): Version | undefined {
    return storage.getData().versions.find(v => v.id === id);
  },

  /**
   * 添加版本
   */
  add(versionData: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>): Version {
    const data = storage.getData();
    const newVersion: Version = {
      ...versionData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    
    data.versions.push(newVersion);
    storage.saveData(data);
    return newVersion;
  },

  /**
   * 更新版本
   */
  update(id: string, updates: Partial<Version>): Version | null {
    const data = storage.getData();
    const index = data.versions.findIndex(v => v.id === id);
    
    if (index === -1) return null;
    
    data.versions[index] = {
      ...data.versions[index],
      ...updates,
      updatedAt: getCurrentTimestamp(),
    };
    
    storage.saveData(data);
    return data.versions[index];
  },

  /**
   * 删除版本
   */
  delete(id: string): boolean {
    const data = storage.getData();
    const index = data.versions.findIndex(v => v.id === id);
    
    if (index === -1) return false;
    
    data.versions.splice(index, 1);
    storage.saveData(data);
    return true;
  },

  /**
   * 获取指定日期范围内的版本
   */
  getByDateRange(startDate: string, endDate: string): Version[] {
    const data = storage.getData();
    return data.versions.filter(v => {
      const vDate = new Date(v.startDate);
      return vDate >= new Date(startDate) && vDate <= new Date(endDate);
    });
  },
};

/**
 * 数据导入导出
 */
export const dataService = {
  /**
   * 导出数据为JSON
   */
  exportToJson(): string {
    const data = storage.getData();
    return JSON.stringify(data, null, 2);
  },

  /**
   * 从JSON导入数据
   */
  importFromJson(json: string): boolean {
    try {
      const data = JSON.parse(json) as DataStore;
      
      // 基本验证
      if (!data.games || !data.versions) {
        throw new Error('Invalid data format');
      }
      
      storage.saveData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  /**
   * 下载数据文件
   */
  downloadJson(filename: string = 'chronorail-data.json'): void {
    const json = this.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
