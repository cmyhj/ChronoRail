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

  // 同步所有版本（一键更新）
  const syncFromMihoyo = useCallback(async (targetGameId: string): Promise<{ added: number; updated: number }> => {
    try {
      const history = await mihoyoService.fetchVersionHistory(targetGameId);
      if (!history.length) return { added: 0, updated: 0 };

      let added = 0;
      let updated = 0;

      for (const mihoyoVersion of history) {
        // 检查是否已存在
        const existing = versions.find(
          v => v.gameId === targetGameId && v.version === mihoyoVersion.version
        );

        if (existing) {
          // 需要更新的字段
          const updates: Partial<Version> = {};
          
          // 更新名称（如果不同）
          if (mihoyoVersion.name && existing.name !== mihoyoVersion.name) {
            updates.name = mihoyoVersion.name;
          }
          
          // 更新开始日期（如果不同）
          if (mihoyoVersion.startDate && existing.startDate !== mihoyoVersion.startDate) {
            updates.startDate = mihoyoVersion.startDate;
          }
          
          // 更新结束日期（如果之前没有或不同）
          if (mihoyoVersion.endDate && (!existing.endDate || existing.endDate !== mihoyoVersion.endDate)) {
            updates.endDate = mihoyoVersion.endDate;
          }
          
          // 如果有需要更新的字段
          if (Object.keys(updates).length > 0) {
            versionService.update(existing.id, updates);
            updated++;
          }
        } else {
          // 添加新版本
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

      // 重新加载数据
      loadVersions();

      return { added, updated };
    } catch (error) {
      console.error('Failed to sync versions:', error);
      return { added: 0, updated: 0 };
    }
  }, [versions, loadVersions]);

  return {
    versions,
    addVersion,
    updateVersion,
    deleteVersion,
    syncFromMihoyo,
    refresh: loadVersions,
  };
}
