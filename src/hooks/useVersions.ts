import { useState, useCallback } from 'react';
import type { Version, VersionFormData } from '../types';
import { versionService } from '../services/storage';
import { mihoyoService } from '../services/mihoyo';

/**
 * 版本数据管理Hook
 */
export function useVersions(gameId?: string) {
  const [versions, setVersions] = useState<Version[]>(() => {
    try {
      return gameId ? versionService.getByGameId(gameId) : versionService.getAll();
    } catch {
      return [];
    }
  });

  // 加载版本列表
  const loadVersions = useCallback(() => {
    try {
      const data = gameId ? versionService.getByGameId(gameId) : versionService.getAll();
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  }, [gameId]);

  // 添加版本
  const addVersion = useCallback((formData: VersionFormData, targetGameId: string): Version => {
    const newVersion = versionService.add({
      gameId: targetGameId,
      version: formData.version,
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      isAutoFetched: false,
    });
    setVersions(prev => [...prev, newVersion]);
    return newVersion;
  }, []);

  // 更新版本
  const updateVersion = useCallback((id: string, updates: Partial<Version>): Version | null => {
    const updated = versionService.update(id, updates);
    if (updated) {
      setVersions(prev => prev.map(v => v.id === id ? updated : v));
    }
    return updated;
  }, []);

  // 删除版本
  const deleteVersion = useCallback((id: string): boolean => {
    const success = versionService.delete(id);
    if (success) {
      setVersions(prev => prev.filter(v => v.id !== id));
    }
    return success;
  }, []);

  // 同步版本（从 mihoyo 数据源）
  const syncFromMihoyo = useCallback(async (targetGameId: string): Promise<{ added: number; updated: number }> => {
    try {
      const history = await mihoyoService.fetchVersionHistory(targetGameId);
      if (!history.length) return { added: 0, updated: 0 };

      // 直接从 storage 读取最新数据，避免闭包捕获旧 state
      const currentVersions = gameId ? versionService.getByGameId(gameId) : versionService.getAll();
      let added = 0;
      let updated = 0;

      for (const mihoyoVersion of history) {
        const existing = currentVersions.find(
          v => v.gameId === targetGameId && v.version === mihoyoVersion.version
        );

        if (existing) {
          const updates: Partial<Version> = {};
          
          if (mihoyoVersion.name && existing.name !== mihoyoVersion.name) {
            updates.name = mihoyoVersion.name;
          }
          if (mihoyoVersion.startDate && existing.startDate !== mihoyoVersion.startDate) {
            updates.startDate = mihoyoVersion.startDate;
          }
          if (mihoyoVersion.endDate && (!existing.endDate || existing.endDate !== mihoyoVersion.endDate)) {
            updates.endDate = mihoyoVersion.endDate;
          }
          
          if (Object.keys(updates).length > 0) {
            versionService.update(existing.id, updates);
            updated++;
          }
        } else {
          versionService.add({
            gameId: targetGameId,
            version: mihoyoVersion.version,
            name: mihoyoVersion.name,
            startDate: mihoyoVersion.startDate,
            endDate: mihoyoVersion.endDate,
            isAutoFetched: true,
          });
          added++;
        }
      }

      if (added > 0 || updated > 0) {
        loadVersions();
      }

      return { added, updated };
    } catch {
      return { added: 0, updated: 0 };
    }
  }, [gameId, loadVersions]);

  return {
    versions,
    addVersion,
    updateVersion,
    deleteVersion,
    syncFromMihoyo,
    refresh: loadVersions,
  };
}
