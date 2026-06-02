import React, { useState, useEffect } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import type { Game, GameFormData } from '../../types';
import { MIHOYO_GAMES } from '../../utils/parser';
import type { MihoyoGameId } from '../../utils/parser';

interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GameFormData) => void;
  onAddMihoyo?: (gameId: MihoyoGameId) => void;
  initialData?: Game;
  existingGames?: Game[];
}

const presetColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
];

export const GameForm: React.FC<GameFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddMihoyo,
  initialData,
  existingGames = [],
}) => {
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    icon: '',
    color: '#6366f1',
    autoFetch: false,
    fetchSource: 'manual',
  });

  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        icon: initialData.icon,
        color: initialData.color,
        autoFetch: initialData.autoFetch,
        fetchSource: initialData.fetchSource || 'manual',
      });
      setActiveTab('custom');
    } else {
      setFormData({
        name: '',
        icon: '',
        color: '#6366f1',
        autoFetch: false,
        fetchSource: 'manual',
      });
      setActiveTab('preset');
    }
  }, [initialData, isOpen]);

  // 检查米哈游游戏是否已添加
  const isMihoyoGameAdded = (gameId: MihoyoGameId) => {
    return existingGames.some(g => g.id === gameId);
  };

  // 处理米哈游游戏添加
  const handleAddMihoyoGame = (gameId: MihoyoGameId) => {
    if (onAddMihoyo) {
      onAddMihoyo(gameId);
      onClose();
    }
  };

  // 处理自定义表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑游戏' : '添加游戏'}
      size="lg"
    >
      {/* 标签页 */}
      {!initialData && (
        <div className="flex mb-6 bg-[#16162a] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preset'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            预置游戏
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            自定义游戏
          </button>
        </div>
      )}

      {/* 预置游戏列表 */}
      {activeTab === 'preset' && !initialData && (
        <div className="space-y-3">
          <p className="text-sm text-[#94a3b8] mb-4">
            选择预置的米哈游游戏，将自动配置API获取版本信息
          </p>
          
          {Object.entries(MIHOYO_GAMES).map(([id, config]) => {
            const isAdded = isMihoyoGameAdded(id as MihoyoGameId);
            return (
              <div
                key={id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isAdded
                    ? 'bg-[#252540]/50 border-[#2d2d4a] opacity-50'
                    : 'bg-[#1a1a2e] border-[#2d2d4a] hover:border-[#6366f1]/50 cursor-pointer'
                }`}
                onClick={() => !isAdded && handleAddMihoyoGame(id as MihoyoGameId)}
              >
                <div>
                  <h4 className="text-sm font-medium text-[#e2e8f0]">
                    {config.name}
                  </h4>
                  <p className="text-xs text-[#64748b] mt-1">
                    {isAdded ? '已添加' : '支持自动获取版本信息'}
                  </p>
                </div>
                <Button
                  variant={isAdded ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={isAdded}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAdded) handleAddMihoyoGame(id as MihoyoGameId);
                  }}
                >
                  {isAdded ? '已添加' : '添加'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* 自定义表单 */}
      {activeTab === 'custom' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 游戏名称 */}
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              游戏名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入游戏名称"
              className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
              required
            />
          </div>

          {/* 图标URL */}
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              图标URL（可选）
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="输入图标URL地址"
              className="w-full px-4 py-2.5 bg-[#16162a] border border-[#2d2d4a] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
            <p className="text-xs text-[#64748b] mt-1">
              留空将使用默认图标
            </p>
          </div>

          {/* 主题色 */}
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              主题色
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presetColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 bg-[#16162a] border border-[#2d2d4a] rounded-lg cursor-pointer"
            />
          </div>

          {/* 自动获取 */}
          <div className="flex items-center justify-between p-4 bg-[#16162a] rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-[#e2e8f0]">自动获取版本</h4>
              <p className="text-xs text-[#64748b] mt-1">
                启用后将自动从API获取版本更新信息
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoFetch}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  autoFetch: e.target.checked,
                  fetchSource: e.target.checked ? 'mihoyo' : 'manual',
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#252540] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366f1]"></div>
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {initialData ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
