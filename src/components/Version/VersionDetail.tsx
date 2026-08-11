import React from 'react';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { GameIcon } from '../Common/GameIcon';
import { gameColors } from '../Common/gameData';
import type { Game, Version } from '../../types';

interface VersionDetailProps {
  isOpen: boolean;
  onClose: () => void;
  version: Version | null;
  game?: Game;
  onEdit?: (version: Version) => void;
  onDelete?: (version: Version) => void;
}

export const VersionDetail: React.FC<VersionDetailProps> = ({
  isOpen,
  onClose,
  version,
  game,
  onEdit,
  onDelete,
}) => {
  if (!version) return null;

  const startDate = dayjs(version.startDate);
  const endDate = version.endDate ? dayjs(version.endDate) : null;
  const duration = endDate ? endDate.diff(startDate, 'day') : null;
  const daysFromNow = dayjs().diff(startDate, 'day');
  const isCurrent = endDate
    ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
    : dayjs().isAfter(startDate);

  const color = game?.color || gameColors[version.gameId] || '#6366f1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="版本详情"
      size="md"
    >
      <div className="space-y-6">
        {/* 头部信息 */}
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <GameIcon gameId={version.gameId} size={36} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-fg">
                v{version.version}
              </h3>
              {isCurrent && (
                <span className="px-2 py-0.5 text-xs bg-success/15 text-success rounded-full">
                  当前版本
                </span>
              )}
            </div>
            <p className="text-lg text-fg-2">{version.name}</p>
            {game && (
              <p className="text-sm text-fg-3 mt-1">{game.name}</p>
            )}
          </div>
        </div>

        {/* 时间信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-panel rounded-lg p-4 border border-line">
            <div className="flex items-center gap-2 text-fg-3 mb-2">
              <Calendar size={16} />
              <span className="text-sm">更新日期</span>
            </div>
            <p className="text-fg font-medium">
              {startDate.format('YYYY-MM-DD')}
            </p>
            <p className="text-xs text-fg-3 mt-1">
              {daysFromNow >= 0 ? `${daysFromNow}天前` : `${Math.abs(daysFromNow)}天后`}
            </p>
          </div>
          
          {endDate && (
            <div className="bg-panel rounded-lg p-4 border border-line">
              <div className="flex items-center gap-2 text-fg-3 mb-2">
                <Clock size={16} />
                <span className="text-sm">持续时间</span>
              </div>
              <p className="text-fg font-medium">
                {duration}天
              </p>
              <p className="text-xs text-fg-3 mt-1">
                {endDate.format('YYYY-MM-DD')} 结束
              </p>
            </div>
          )}
        </div>

        {/* 版本描述 */}
        {version.description && (
          <div className="bg-panel rounded-lg p-4 border border-line">
            <h4 className="text-sm font-medium text-fg-3 mb-2">版本描述</h4>
            <p className="text-fg">{version.description}</p>
          </div>
        )}

        {/* 元信息 */}
        <div className="bg-panel rounded-lg p-4 border border-line">
          <h4 className="text-sm font-medium text-fg-3 mb-3">其他信息</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-3">数据来源</span>
              <span className="text-fg">
                {version.isAutoFetched ? '自动获取' : '手动输入'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-3">创建时间</span>
              <span className="text-fg">
                {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-3">更新时间</span>
              <span className="text-fg">
                {dayjs(version.updatedAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          {onDelete && (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(version);
                onClose();
              }}
              icon={<Trash2 size={16} />}
            >
              删除
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => {
                onEdit(version);
                onClose();
              }}
              icon={<Edit size={16} />}
            >
              编辑
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};
