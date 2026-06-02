import { useState, useEffect, useCallback } from 'react';
import type { Game, GameFormData } from '../types';
import { gameService } from '../services/storage';
import { mihoyoService } from '../services/mihoyo';
import { getGameIcon, getGameColor } from '../utils/parser';
import type { MihoyoGameId } from '../utils/parser';

// 预置游戏配置
const PRESET_GAMES: Array<{ id: MihoyoGameId; name: string }> = [
  { id: 'genshin', name: '原神' },
  { id: 'starrail', name: '崩坏：星穹铁道' },
  { id: 'zzz', name: '绝区零' },
];

/**
 * 游戏数据管理Hook
 */
export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化预置游戏
  const initializePresetGames = useCallback(() => {
    const existingGames = gameService.getAll();
    const existingIds = existingGames.map(g => g.id);
    
    // 添加缺失的预置游戏
    for (const preset of PRESET_GAMES) {
      if (!existingIds.includes(preset.id)) {
        gameService.add({
          id: preset.id,
          name: preset.name,
          icon: getGameIcon(preset.id),
          color: getGameColor(preset.id),
          autoFetch: true,
          fetchSource: 'mihoyo',
        } as any);
      }
    }
  }, []);

  // 加载游戏列表
  const loadGames = useCallback(() => {
    setLoading(true);
    try {
      initializePresetGames();
      const data = gameService.getAll();
      setGames(data);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  }, [initializePresetGames]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

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
    const success = gameService.delete(id);
    if (success) {
      setGames(prev => prev.filter(g => g.id !== id));
    }
    return success;
  }, []);

  // 添加米哈游游戏
  const addMihoyoGame = useCallback(async (gameId: MihoyoGameId): Promise<Game | null> => {
    try {
      const config = mihoyoService.getSupportedGames().find(g => g.id === gameId);
      if (!config) return null;

      // 检查是否已存在
      const existing = gameService.getAll().find(g => g.id === gameId);
      if (existing) return existing;

      const newGame = gameService.add({
        id: gameId,
        name: config.name,
        icon: getGameIcon(gameId),
        color: getGameColor(gameId),
        autoFetch: true,
        fetchSource: 'mihoyo',
      });

      setGames(prev => [...prev, newGame]);
      return newGame;
    } catch (error) {
      console.error('Failed to add mihoyo game:', error);
      return null;
    }
  }, []);

  // 根据ID获取游戏
  const getGameById = useCallback((id: string): Game | undefined => {
    return games.find(g => g.id === id);
  }, [games]);

  return {
    games,
    loading,
    addGame,
    updateGame,
    deleteGame,
    addMihoyoGame,
    getGameById,
    refresh: loadGames,
  };
}
