import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileDrawer } from './components/Layout/MobileDrawer';
import { TimelineView } from './components/Timeline/TimelineView';
import { CalendarView } from './components/Calendar/CalendarView';
import { GameList } from './components/Game/GameList';
import { GameForm } from './components/Game/GameForm';
import { VersionForm } from './components/Version/VersionForm';
import { VersionDetail } from './components/Version/VersionDetail';
import { GitHubSettings } from './components/Common/GitHubSettings';
import { Toast } from './components/Common/Toast';
import { useGames } from './hooks/useGames';
import { useVersions } from './hooks/useVersions';
import { useResponsive } from './hooks/useResponsive';
import { useGitHub } from './hooks/useGitHub';
import type { Game, Version, GameFormData, VersionFormData, GitHubConfig } from './types';
import type { MihoyoGameId } from './utils/parser';

const App: React.FC = () => {
  const { isMobile } = useResponsive();
  const { games, addGame, updateGame, deleteGame, addMihoyoGame } = useGames();
  const { versions, addVersion, updateVersion, deleteVersion, fetchFromMihoyo, syncFromMihoyo } = useVersions();
  const { saveConfig, clearConfig, testConnection } = useGitHub();

  // 移动端抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 游戏表单状态
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();

  // 版本表单状态
  const [versionFormOpen, setVersionFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | undefined>();
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  // 版本详情状态
  const [versionDetailOpen, setVersionDetailOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // GitHub设置状态
  const [githubSettingsOpen, setGithubSettingsOpen] = useState(false);

  // Toast状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 获取游戏信息
  const getGame = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  // 显示Toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 处理游戏添加
  const handleAddGame = useCallback(() => {
    setEditingGame(undefined);
    setGameFormOpen(true);
  }, []);

  // 处理游戏编辑
  const handleEditGame = useCallback((game: Game) => {
    setEditingGame(game);
    setGameFormOpen(true);
  }, []);

  // 处理游戏删除
  const handleDeleteGame = useCallback((game: Game) => {
    if (window.confirm(`确定要删除游戏 "${game.name}" 吗？相关的版本数据也会被删除。`)) {
      deleteGame(game.id);
    }
  }, [deleteGame]);

  // 处理游戏表单提交
  const handleGameFormSubmit = useCallback((data: GameFormData) => {
    if (editingGame) {
      updateGame(editingGame.id, data);
    } else {
      addGame(data);
    }
  }, [editingGame, addGame, updateGame]);

  // 处理米哈游游戏添加
  const handleAddMihoyoGame = useCallback((gameId: MihoyoGameId) => {
    addMihoyoGame(gameId);
  }, [addMihoyoGame]);

  // 处理版本编辑
  const handleEditVersion = useCallback((version: Version) => {
    setSelectedGameId(version.gameId);
    setEditingVersion(version);
    setVersionFormOpen(true);
  }, []);

  // 处理版本删除
  const handleDeleteVersion = useCallback((version: Version) => {
    if (window.confirm(`确定要删除版本 v${version.version} 吗？`)) {
      deleteVersion(version.id);
    }
  }, [deleteVersion]);

  // 处理版本表单提交
  const handleVersionFormSubmit = useCallback((data: VersionFormData) => {
    if (editingVersion) {
      updateVersion(editingVersion.id, data);
    } else {
      addVersion(data, selectedGameId);
    }
  }, [editingVersion, selectedGameId, addVersion, updateVersion]);

  // 处理版本点击
  const handleVersionClick = useCallback((version: Version) => {
    setSelectedVersion(version);
    setVersionDetailOpen(true);
  }, []);

  // 处理从米哈游获取单个版本
  const handleFetchFromMihoyo = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      const result = await fetchFromMihoyo(gameId as MihoyoGameId);
      if (result) {
        showToast('版本数据已更新', 'success');
        return true;
      } else {
        showToast('未找到新版本', 'info');
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch from mihoyo:', error);
      showToast('获取失败，请稍后重试', 'error');
      return false;
    }
  }, [fetchFromMihoyo, showToast]);

  // 一键更新所有游戏版本
  const handleSyncAll = useCallback(async () => {
    showToast('正在同步版本数据...', 'info');
    
    let totalAdded = 0;
    let totalUpdated = 0;
    
    for (const game of games) {
      if (game.autoFetch) {
        try {
          const result = await syncFromMihoyo(game.id as MihoyoGameId);
          totalAdded += result.added;
          totalUpdated += result.updated;
        } catch (error) {
          console.error(`Failed to sync ${game.id}:`, error);
        }
      }
    }
    
    if (totalAdded > 0 || totalUpdated > 0) {
      showToast(`同步完成：新增 ${totalAdded} 个版本，更新 ${totalUpdated} 个版本`, 'success');
    } else {
      showToast('所有版本数据已是最新', 'info');
    }
  }, [games, syncFromMihoyo, showToast]);

  // 处理GitHub配置保存
  const handleGitHubSave = useCallback((config: GitHubConfig) => {
    saveConfig(config);
  }, [saveConfig]);

  // 处理GitHub配置清除
  const handleGitHubClear = useCallback(() => {
    clearConfig();
  }, [clearConfig]);

  return (
    <Router basename="/ChronoRail">
      <div className="h-screen flex flex-col bg-[#0f0f23]">
        {/* 头部 */}
        <Header 
          onMenuToggle={() => setDrawerOpen(true)} 
          onSyncAll={handleSyncAll}
        />

        {/* 主体 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 桌面端侧边栏 */}
          {!isMobile && (
            <Sidebar
              games={games}
              onAddGame={handleAddGame}
              onRefreshGame={handleFetchFromMihoyo}
              onSyncAll={handleSyncAll}
            />
          )}

          {/* 内容区域 */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              {/* 时间轴视图 */}
              <Route
                path="/"
                element={
                  <TimelineView
                    games={games}
                    versions={versions}
                    onVersionClick={handleVersionClick}
                  />
                }
              />

              {/* 日历视图 */}
              <Route
                path="/calendar"
                element={
                  <CalendarView
                    games={games}
                    versions={versions}
                    onVersionClick={handleVersionClick}
                  />
                }
              />

              {/* 游戏管理 */}
              <Route
                path="/games"
                element={
                  <GameList
                    games={games}
                    onAdd={handleAddGame}
                    onEdit={handleEditGame}
                    onDelete={handleDeleteGame}
                    onRefreshVersions={(game) => handleFetchFromMihoyo(game.id)}
                  />
                }
              />
            </Routes>
          </main>
        </div>

        {/* 移动端抽屉 */}
        {isMobile && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            games={games}
            onAddGame={handleAddGame}
            onRefreshGame={handleFetchFromMihoyo}
            onSyncAll={handleSyncAll}
          />
        )}

        {/* 游戏表单弹窗 */}
        <GameForm
          isOpen={gameFormOpen}
          onClose={() => setGameFormOpen(false)}
          onSubmit={handleGameFormSubmit}
          onAddMihoyo={handleAddMihoyoGame}
          initialData={editingGame}
          existingGames={games}
        />

        {/* 版本表单弹窗 */}
        <VersionForm
          isOpen={versionFormOpen}
          onClose={() => setVersionFormOpen(false)}
          onSubmit={handleVersionFormSubmit}
          initialData={editingVersion}
          gameName={getGame(selectedGameId)?.name || ''}
        />

        {/* 版本详情弹窗 */}
        <VersionDetail
          isOpen={versionDetailOpen}
          onClose={() => setVersionDetailOpen(false)}
          version={selectedVersion}
          game={selectedVersion ? getGame(selectedVersion.gameId) : undefined}
          onEdit={handleEditVersion}
          onDelete={handleDeleteVersion}
        />

        {/* GitHub设置弹窗 */}
        <GitHubSettings
          isOpen={githubSettingsOpen}
          onClose={() => setGithubSettingsOpen(false)}
          config={null}
          onSave={handleGitHubSave}
          onClear={handleGitHubClear}
          onTest={testConnection}
        />

        {/* Toast通知 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
