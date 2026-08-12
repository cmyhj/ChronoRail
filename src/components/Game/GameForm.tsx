import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { GameIcon } from '../Common/GameIcon';
import type { Game, GameFormData } from '../../types';
import { getPresetGames } from '../../utils/parser';
import type { GameId } from '../../utils/parser';

interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GameFormData) => void;
  onAddPreset?: (gameId: GameId) => void;
  onResetPresets?: () => void;
  initialData?: Game;
  existingGames?: Game[];
}

const presetColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
];

const defaultFormData: GameFormData = {
  name: '',
  icon: '',
  color: '#6366f1',
  autoFetch: false,
  fetchSource: 'manual',
};

export const GameForm: React.FC<GameFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddPreset,
  onResetPresets,
  initialData,
  existingGames = [],
}) => {
  const [formData, setFormData] = useState<GameFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        icon: initialData.icon,
        color: initialData.color,
        autoFetch: initialData.autoFetch,
        fetchSource: initialData.fetchSource || 'manual',
      };
    }
    return defaultFormData;
  });

  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>(initialData ? 'custom' : 'preset');

  const isGameAdded = (gameId: string) => {
    return existingGames.some((g) => g.id === gameId);
  };

  const handleAddPresetGame = (gameId: GameId) => {
    if (onAddPreset) {
      onAddPreset(gameId);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  const presetGames = getPresetGames();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑游戏' : '添加游戏'}
      size="lg"
    >
      {!initialData && (
        <div className="flex mb-5 bg-elevated rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[13px] font-medium transition-colors duration-150 ${
              activeTab === 'preset'
                ? 'bg-accent text-white'
                : 'text-fg-3 hover:text-fg-2'
            }`}
          >
            游戏库
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[13px] font-medium transition-colors duration-150 ${
              activeTab === 'custom'
                ? 'bg-accent text-white'
                : 'text-fg-3 hover:text-fg-2'
            }`}
          >
            自定义游戏
          </button>
        </div>
      )}

      {activeTab === 'preset' && !initialData && (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          <p className="text-[12px] text-fg-3 mb-3">
            从游戏库中选择，支持自动获取的会自动配置API
          </p>

          {presetGames.map((config) => {
            const isAdded = isGameAdded(config.id);
            return (
              <div
                key={config.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors duration-150 ${
                  isAdded
                    ? 'bg-hover/30 border-line opacity-50'
                    : 'bg-card border-line hover:border-line-strong cursor-pointer'
                }`}
                onClick={() => !isAdded && handleAddPresetGame(config.id as GameId)}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}12` }}
                  >
                    <GameIcon gameId={config.id} size={22} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-fg">
                      {config.name}
                    </h4>
                    <p className="text-[10px] text-fg-4 mt-0.5">
                      {config.autoFetch ? '支持自动获取' : '需要手动输入'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isAdded ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={isAdded}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAdded) handleAddPresetGame(config.id as GameId);
                  }}
                >
                  {isAdded ? '已添加' : '添加'}
                </Button>
              </div>
            );
          })}

          {onResetPresets && (
            <div className="pt-3 border-t border-line mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm('确定要恢复所有预置游戏吗？这将重新添加被删除的预置游戏。')) {
                    onResetPresets();
                    onClose();
                  }
                }}
                className="w-full"
              >
                恢复所有预置游戏
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">游戏名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="输入游戏名称"
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="field-label">图标URL（可选）</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="输入图标URL地址"
              className="input-base"
            />
            <p className="text-[10px] text-fg-4 mt-1">留空将使用默认图标</p>
          </div>

          <div>
            <label className="field-label">主题色</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-7 h-7 rounded-lg transition-all duration-150 ${
                    formData.color === color ? 'scale-110 ring-2 ring-white/30' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              className="w-full h-9 bg-input border border-line rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-elevated rounded-lg border border-line">
            <div>
              <h4 className="text-[13px] font-medium text-fg">自动获取版本</h4>
              <p className="text-[10px] text-fg-4 mt-0.5">
                启用后将自动从API获取版本更新信息
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoFetch}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  autoFetch: e.target.checked,
                  fetchSource: e.target.checked ? 'mihoyo' : 'manual',
                }))}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" size="sm">
              {initialData ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
