import { useState, useCallback } from 'react';
import type { GitHubConfig } from '../types';
import { githubService } from '../services/github';

/**
 * GitHub同步Hook
 */
export function useGitHub() {
  const [isConfigured, setIsConfigured] = useState(() => githubService.isConfigured());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 保存配置
  const saveConfig = useCallback((config: GitHubConfig) => {
    githubService.saveConfig(config);
    setIsConfigured(true);
    setError(null);
  }, []);

  // 清除配置
  const clearConfig = useCallback(() => {
    githubService.clearConfig();
    setIsConfigured(false);
    setLastSyncTime(null);
    setError(null);
  }, []);

  // 测试连接
  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    return await githubService.testConnection();
  }, []);

  // 从GitHub同步到本地
  const syncFromGitHub = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) {
      setError('未配置GitHub');
      return false;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const success = await githubService.syncFromGitHub();
      if (success) {
        setLastSyncTime(new Date().toISOString());
        return true;
      } else {
        setError('同步失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured]);

  // 从本地同步到GitHub
  const syncToGitHub = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) {
      setError('未配置GitHub');
      return false;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const success = await githubService.syncToGitHub();
      if (success) {
        setLastSyncTime(new Date().toISOString());
        return true;
      } else {
        setError('同步失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured]);

  // 双向同步（先拉取再推送）
  const sync = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) {
      setError('未配置GitHub');
      return false;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // 先从GitHub拉取
      await githubService.syncFromGitHub();
      // 再推送到GitHub
      const success = await githubService.syncToGitHub();
      
      if (success) {
        setLastSyncTime(new Date().toISOString());
        return true;
      } else {
        setError('同步失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured]);

  return {
    isConfigured,
    isSyncing,
    lastSyncTime,
    error,
    saveConfig,
    clearConfig,
    testConnection,
    syncFromGitHub,
    syncToGitHub,
    sync,
  };
}
