import type { DataStore, GitHubConfig } from '../types';
import { storage } from './storage';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub API服务
 */
export const githubService = {
  /**
   * 获取当前配置
   */
  getConfig(): GitHubConfig | null {
    return storage.getGitHubConfig();
  },

  /**
   * 保存配置
   */
  saveConfig(config: GitHubConfig): void {
    storage.saveGitHubConfig(config);
  },

  /**
   * 清除配置
   */
  clearConfig(): void {
    storage.clearGitHubConfig();
  },

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.token && config?.owner && config?.repo);
  },

  /**
   * 获取文件内容
   */
  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    const config = this.getConfig();
    if (!config) return null;

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const content = atob(data.content);
      
      return {
        content,
        sha: data.sha,
      };
    } catch (error) {
      console.error('Failed to get file from GitHub:', error);
      return null;
    }
  },

  /**
   * 创建或更新文件
   */
  async upsertFile(path: string, content: string, sha?: string): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;

    try {
      const body: { message: string; content: string; sha?: string } = {
        message: `Update ${path} [skip ci]`,
        content: btoa(unescape(encodeURIComponent(content))),
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to upsert file to GitHub:', error);
      return false;
    }
  },

  /**
   * 从GitHub同步数据到本地
   */
  async syncFromGitHub(): Promise<boolean> {
    try {
      const config = this.getConfig();
      if (!config) return false;

      const result = await this.getFile(config.path);
      if (!result) return false;

      const data = JSON.parse(result.content) as DataStore;
      storage.saveData(data);
      return true;
    } catch (error) {
      console.error('Failed to sync from GitHub:', error);
      return false;
    }
  },

  /**
   * 从本地同步数据到GitHub
   */
  async syncToGitHub(): Promise<boolean> {
    try {
      const config = this.getConfig();
      if (!config) return false;

      const data = storage.getData();
      const content = JSON.stringify(data, null, 2);

      // 获取当前文件SHA（如果存在）
      const existing = await this.getFile(config.path);
      const sha = existing?.sha;

      return await this.upsertFile(config.path, content, sha);
    } catch (error) {
      console.error('Failed to sync to GitHub:', error);
      return false;
    }
  },

  /**
   * 测试GitHub连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config) {
      return { success: false, message: '未配置GitHub' };
    }

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`,
        {
          headers: {
            Authorization: `token ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, message: 'Token无效或已过期' };
        }
        if (response.status === 404) {
          return { success: false, message: '仓库不存在或无权访问' };
        }
        return { success: false, message: `连接失败: ${response.status}` };
      }

      return { success: true, message: '连接成功' };
    } catch {
      return { success: false, message: '网络错误' };
    }
  },
};
