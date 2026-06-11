import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { TestTube, Check, X, Loader2 } from 'lucide-react';
import type { GitHubConfig } from '../../types';

interface GitHubSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubConfig | null;
  onSave: (config: GitHubConfig) => void;
  onClear: () => void;
  onTest: () => Promise<{ success: boolean; message: string }>;
}

const defaultConfig: GitHubConfig = {
  token: '',
  owner: 'cmyhj',
  repo: 'ChronoRail',
  path: 'data/chronorail.json',
};

export const GitHubSettings: React.FC<GitHubSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onClear,
  onTest,
}) => {
  const [formData, setFormData] = useState<GitHubConfig>(config || defaultConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.token.trim()) return;
    onSave(formData);
    onClose();
  };

  // 测试连接
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    // 先保存配置
    onSave(formData);
    
    try {
      const result = await onTest();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: '测试失败' });
    } finally {
      setTesting(false);
    }
  };

  // 清除配置
  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GitHub 同步配置"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 说明 */}
        <div className="bg-[#16162a] rounded-xl p-4 border border-[#2d2d4a]">
          <div className="flex items-start gap-3">
            <svg className="text-[#6366f1] mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div>
              <h4 className="text-sm font-medium text-[#e2e8f0] mb-1">
                GitHub 云端同步
              </h4>
              <p className="text-xs text-[#64748b]">
                配置 GitHub Personal Access Token 后，可以将数据同步到 GitHub 仓库，
                实现多设备访问和数据备份。
              </p>
            </div>
          </div>
        </div>

        {/* Token */}
        <div>
          <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
            Personal Access Token *
          </label>
          <input
            type="password"
            value={formData.token}
            onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
            required
          />
          <p className="text-xs text-[#64748b] mt-1">
            需要 repo 权限。在 GitHub Settings → Developer settings → Personal access tokens 创建
          </p>
        </div>

        {/* 仓库信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              仓库所有者
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              placeholder="cmyhj"
              className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              仓库名称
            </label>
            <input
              type="text"
              value={formData.repo}
              onChange={(e) => setFormData(prev => ({ ...prev, repo: e.target.value }))}
              placeholder="ChronoRail"
              className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>
        </div>

        {/* 文件路径 */}
        <div>
          <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
            数据文件路径
          </label>
          <input
            type="text"
            value={formData.path}
            onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
            placeholder="data/chronorail.json"
            className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
          />
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult.success
                ? 'bg-[#67c23a]/10 text-[#67c23a]'
                : 'bg-[#ef4444]/10 text-[#ef4444]'
            }`}
          >
            {testResult.success ? <Check size={16} /> : <X size={16} />}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleTest}
              disabled={testing || !formData.token}
              icon={testing ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} />}
            >
              测试连接
            </Button>
            
            {config && (
              <Button
                type="button"
                variant="danger"
                onClick={handleClear}
              >
                清除配置
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={!formData.token}>
              保存
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
