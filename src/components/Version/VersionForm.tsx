import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import type { Version, VersionFormData } from '../../types';

interface VersionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VersionFormData) => void;
  initialData?: Version;
  gameName: string;
}

export const VersionForm: React.FC<VersionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  gameName,
}) => {
  const [formData, setFormData] = useState<VersionFormData>(() => {
    if (initialData) {
      return {
        version: initialData.version,
        name: initialData.name,
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        description: initialData.description || '',
      };
    }
    return {
      version: '',
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
    };
  });

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.version.trim() || !formData.name.trim() || !formData.startDate) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑版本' : '添加版本'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 游戏名称（只读） */}
        <div>
          <label className="field-label">
            游戏
          </label>
          <input
            type="text"
            value={gameName}
            disabled
            className="input-base disabled:opacity-50"
          />
        </div>

        {/* 版本号 */}
        <div>
          <label className="field-label">
            版本号 *
          </label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            placeholder="例如: 4.3, 1.5, 2.0"
            className="input-base"
            required
          />
        </div>

        {/* 版本名称 */}
        <div>
          <label className="field-label">
            版本名称 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="例如: 沉于生者的忘川"
            className="input-base"
            required
          />
        </div>

        {/* 日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">
              更新日期 *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="input-base"
              required
            />
          </div>
          
          <div>
            <label className="field-label">
              结束日期（可选）
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="input-base"
            />
          </div>
        </div>

        {/* 版本描述 */}
        <div>
          <label className="field-label">
            版本描述（可选）
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="输入版本更新内容摘要..."
            rows={3}
            className="input-base resize-none"
          />
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
    </Modal>
  );
};
