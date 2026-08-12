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
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}12` }}
          >
            <GameIcon gameId={version.gameId} size={32} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-xl font-bold text-fg">
                v{version.version}
              </h3>
              {isCurrent && (
                <span className="px-2 py-0.5 text-[10px] bg-success/15 text-success rounded-full font-medium">
                  当前版本
                </span>
              )}
            </div>
            <p className="text-[14px] text-fg-2">{version.name}</p>
            {game && (
              <p className="text-[12px] text-fg-3 mt-0.5">{game.name}</p>
            )}
          </div>
        </div>

        {/* Time info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-elevated rounded-lg p-3 border border-line">
            <div className="flex items-center gap-1.5 text-fg-4 mb-1.5">
              <Calendar size={14} />
              <span className="text-[11px]">更新日期</span>
            </div>
            <p className="text-[13px] text-fg font-medium tabular-nums">
              {startDate.format('YYYY-MM-DD')}
            </p>
            <p className="text-[11px] text-fg-3 mt-0.5">
              {daysFromNow >= 0 ? `${daysFromNow}天前` : `${Math.abs(daysFromNow)}天后`}
            </p>
          </div>

          {endDate && (
            <div className="bg-elevated rounded-lg p-3 border border-line">
              <div className="flex items-center gap-1.5 text-fg-4 mb-1.5">
                <Clock size={14} />
                <span className="text-[11px]">持续时间</span>
              </div>
              <p className="text-[13px] text-fg font-medium tabular-nums">
                {duration}天
              </p>
              <p className="text-[11px] text-fg-3 mt-0.5">
                {endDate.format('YYYY-MM-DD')} 结束
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {version.description && (
          <div className="bg-elevated rounded-lg p-3 border border-line">
            <h4 className="text-[11px] font-medium text-fg-4 mb-1.5">版本描述</h4>
            <p className="text-[13px] text-fg">{version.description}</p>
          </div>
        )}

        {/* Meta */}
        <div className="bg-elevated rounded-lg p-3 border border-line">
          <h4 className="text-[11px] font-medium text-fg-4 mb-2">其他信息</h4>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-fg-3">数据来源</span>
              <span className="text-fg">
                {version.isAutoFetched ? '自动获取' : '手动输入'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-3">创建时间</span>
              <span className="text-fg tabular-nums">
                {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-3">更新时间</span>
              <span className="text-fg tabular-nums">
                {dayjs(version.updatedAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete(version);
                onClose();
              }}
              icon={<Trash2 size={14} />}
            >
              删除
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onEdit(version);
                onClose();
              }}
              icon={<Edit size={14} />}
            >
              编辑
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};
