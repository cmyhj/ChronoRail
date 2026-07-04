import { useState, useCallback } from 'react';
import type { Game, GameFormData } from '../types';
import { gameService } from '../services/storage';
import { GAME_CONFIGS } from '../utils/parser';
import type { GameId } from '../utils/parser';

// 默认预置游戏列表（显示在侧边栏，同时决定排序）
export const DEFAULT_PRESET_GAMES: GameId[] = [
  'genshin',
  'starrail',
  'zzz',
  'wutheringwaves',
  'arknights',
  'reverse1999',
  'arknights_endfield',
  'yihuan',
  'doublehelix',
];

// 已删除预置游戏的存储键
const DELETED_PRESETS_KEY = 'chronorail_deleted_presets';

/**
 * 获取已删除的预置游戏ID列表
 */
function getDeletedPresets(): string[] {
  try {
    const data = localStorage.getItem(DELETED_PRESETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 保存已删除的预置游戏ID
 */
function saveDeletedPreset(id: string): void {
  const deleted = getDeletedPresets();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_PRESETS_KEY, JSON.stringify(deleted));
  }
}

/**
 * 初始化预置游戏（模块级函数，可在 useState 初始化器中调用）
 */
function initializePresetGames(): void {
  const existingGames = gameService.getAll();
  const existingIds = existingGames.map(g => g.id);
  const deletedPresets = getDeletedPresets();
  
  for (const gameId of DEFAULT_PRESET_GAMES) {
    if (!existingIds.includes(gameId) && !deletedPresets.includes(gameId)) {
      const config = GAME_CONFIGS[gameId];
      if (config) {
        gameService.add({
          id: config.id,
          name: config.name,
          icon: config.icon,
          color: config.color,
          autoFetch: config.autoFetch,
          fetchSource: config.autoFetch ? 'mihoyo' : 'manual',
        });
      }
    }
  }
}

/**
 * 游戏数据管理Hook
 */
export function useGames() {
  const [games, setGames] = useState<Game[]>(() => {
    try {
      initializePresetGames();
      return gameService.getAll();
    } catch {
      return [];
    }
  });

  // 添加游戏
  const addGame = useCallback((formData: GameFormData): Game => {
    const newGame = gameService.add({
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      autoFetch: formData.autoFetch,
      fetchSource: formData.fetchSource,
    });
    setGames(prev => [...prev, newGame]);
    return newGame;
  }, []);

  // 更新游戏
  const updateGame = useCallback((id: string, updates: Partial<Game>): Game | null => {
    const updated = gameService.update(id, updates);
    if (updated) {
      setGames(prev => prev.map(g => g.id === id ? updated : g));
    }
    return updated;
  }, []);

  // 删除游戏
  const deleteGame = useCallback((id: string): boolean => {
    const isPreset = DEFAULT_PRESET_GAMES.includes(id as GameId);
    if (isPreset) {
      saveDeletedPreset(id);
    }
    
    const success = gameService.delete(id);
    if (success) {
      setGames(prev => prev.filter(g => g.id !== id));
    }
    return success;
  }, []);

  // 重置预置游戏
  const resetPresets = useCallback(() => {
    localStorage.removeItem(DELETED_PRESETS_KEY);
    initializePresetGames();
    setGames(gameService.getAll());
  }, []);

  // 添加预置游戏（从游戏库）
  const addPresetGame = useCallback((gameId: GameId): Game | null => {
    const config = GAME_CONFIGS[gameId];
    if (!config) return null;

    const existing = gameService.getAll().find(g => g.id === gameId);
    if (existing) return existing;

    const deleted = getDeletedPresets();
    if (deleted.includes(gameId)) {
      const newDeleted = deleted.filter(d => d !== gameId);
      localStorage.setItem(DELETED_PRESETS_KEY, JSON.stringify(newDeleted));
    }

    const newGame = gameService.add({
      id: config.id,
      name: config.name,
      icon: config.icon,
      color: config.color,
      autoFetch: config.autoFetch,
      fetchSource: config.autoFetch ? 'mihoyo' : 'manual',
    });

    setGames(prev => [...prev, newGame]);
    return newGame;
  }, []);

  // 根据ID获取游戏
  const getGameById = useCallback((id: string): Game | undefined => {
    return games.find(g => g.id === id);
  }, [games]);

  return {
    games,
    addGame,
    updateGame,
    deleteGame,
    addPresetGame,
    resetPresets,
    getGameById,
  };
}
