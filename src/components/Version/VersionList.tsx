import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import type { Game, Version } from '../../types';

interface VersionListProps {
  game: Game;
  versions: Version[];
  onAdd: () => void;
  onEdit: (version: Version) => void;
  onDelete: (version: Version) => void;
  onFetchFromMihoyo?: () => void;
  loading?: boolean;
}

export const VersionList: React.FC<VersionListProps> = ({
  game,
  versions,
  onAdd,
  onEdit,
  onDelete,
  onFetchFromMihoyo,
  loading = false,
}) => {
  // 按日期排序
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // 计算统计信息
  const currentVersion = sortedVersions.find(v => {
    const startDate = dayjs(v.startDate);
    const endDate = v.endDate ? dayjs(v.endDate) : startDate.add(42, 'day');
    return dayjs().isAfter(startDate) && dayjs().isBefore(endDate);
  });

  const totalVersions = versions.length;
  const avgDuration = versions.filter(v => v.endDate).length > 0
    ? Math.round(
        versions
          .filter(v => v.endDate)
          .reduce((sum, v) => sum + dayjs(v.endDate).diff(dayjs(v.startDate), 'day'), 0) /
          versions.filter(v => v.endDate).length
      )
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <div>
          <h2 className="text-lg font-semibold text-[#e2e8f0]">
            {game.name} - 版本历史
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-[#64748b]">
              共 {totalVersions} 个版本
            </span>
            {avgDuration && (
              <span className="text-sm text-[#64748b]">
                平均周期: {avgDuration}天
              </span>
            )}
            {currentVersion && (
              <span className="text-sm text-[#67c23a]">
                当前: v{currentVersion.version}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {game.autoFetch && onFetchFromMihoyo && (
            <button
              onClick={onFetchFromMihoyo}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#252540] rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              从米哈游获取
            </button>
          )}
          
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg hover:from-[#4f46e5] hover:to-[#6366f1] transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            手动添加
          </button>
        </div>
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-auto p-4">
        {sortedVersions.length > 0 ? (
          <div className="space-y-3">
            {sortedVersions.map(version => {
              const startDate = dayjs(version.startDate);
              const endDate = version.endDate ? dayjs(version.endDate) : null;
              const duration = endDate ? endDate.diff(startDate, 'day') : null;
              const isCurrent = endDate
                ? dayjs().isAfter(startDate) && dayjs().isBefore(endDate)
                : dayjs().isAfter(startDate);
              const daysFromNow = dayjs().diff(startDate, 'day');

              return (
                <div
                  key={version.id}
                  className={`bg-[#1a1a2e] rounded-xl border overflow-hidden transition-all duration-300 hover:border-[#6366f1]/30 hover:shadow-lg hover:shadow-[#6366f1]/5 ${
                    isCurrent ? 'border-[#67c23a] shadow-lg shadow-[#67c23a]/10' : 'border-[#2d2d4a]'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#e2e8f0]">
                            v{version.version}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs bg-[#67c23a]/20 text-[#67c23a] rounded-full">
                              当前版本
                            </span>
                          )}
                          {version.isAutoFetched && (
                            <span className="px-2 py-0.5 text-xs bg-[#6366f1]/20 text-[#6366f1] rounded-full">
                              自动获取
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          {version.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(version)}
                          className="p-2 text-[#64748b] hover:text-[#6366f1] hover:bg-[#252540] rounded-lg transition-colors"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(version)}
                          className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#252540] rounded-lg transition-colors"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#64748b]">
                      <span>更新日期: {startDate.format('YYYY-MM-DD')}</span>
                      {endDate && <span>结束日期: {endDate.format('YYYY-MM-DD')}</span>}
                      {duration !== null && <span>持续天数: {duration}天</span>}
                      {daysFromNow >= 0 && <span>已过 {daysFromNow} 天</span>}
                    </div>

                    {version.description && (
                      <p className="text-sm text-[#94a3b8] mt-3 line-clamp-2">
                        {version.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-[#252540] rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#e2e8f0] mb-2">
              暂无版本记录
            </h3>
            <p className="text-sm text-[#64748b] mb-6 max-w-md">
              {game.autoFetch
                ? '点击"从米哈游获取"按钮自动获取当前版本信息'
                : '点击"手动添加"按钮添加版本信息'}
            </p>
            <div className="flex gap-3">
              {game.autoFetch && onFetchFromMihoyo && (
                <button
                  onClick={onFetchFromMihoyo}
                  className="flex items-center gap-2 px-6 py-3 bg-[#252540] text-[#e2e8f0] rounded-lg hover:bg-[#2d2d4a] transition-colors"
                >
                  <RefreshCw size={18} />
                  从米哈游获取
                </button>
              )}
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white rounded-lg hover:from-[#4f46e5] hover:to-[#6366f1] transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                手动添加
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
