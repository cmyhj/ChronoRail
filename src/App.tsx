import React, { useState, useCallback, useEffect } from 'react';
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
import { RandomNumberView } from './components/RandomNumber/RandomNumberView';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { useGames } from './hooks/useGames';
import { useVersions } from './hooks/useVersions';
import { useResponsive } from './hooks/useResponsive';
import type { Game, Version, GameFormData, VersionFormData } from './types';

const App: React.FC = () => {
  const { isMobile } = useResponsive();
  const { games, addGame, updateGame, deleteGame, addPresetGame, resetPresets } = useGames();
  const { versions, addVersion, updateVersion, deleteVersion, syncFromMihoyo } = useVersions();

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

  // 获取游戏信息
  const getGame = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

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

  // 处理预置游戏添加
  const handleAddPresetGame = useCallback((gameId: string) => {
    addPresetGame(gameId);
  }, [addPresetGame]);

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

  // 页面加载时自动同步所有游戏版本
  useEffect(() => {
    const autoSync = async () => {
      if (games.length === 0) return;
      
      for (const game of games) {
        if (game.autoFetch) {
          try {
            await syncFromMihoyo(game.id);
          } catch {
            // 静默失败
          }
        }
      }
    };
    
    autoSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router basename="/ChronoRail">
      <div className="h-screen flex flex-col bg-[#0f0f23]">
        {/* 头部 */}
        <Header 
          onMenuToggle={() => setDrawerOpen(true)} 
        />

        {/* 主体 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 桌面端侧边栏 */}
          {!isMobile && (
            <Sidebar
              games={games}
              onAddGame={handleAddGame}
            />
          )}

          {/* 内容区域 */}
          <main className="flex-1 overflow-hidden">
            <ErrorBoundary>
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
                  />
                }
              />

              {/* 随机数 */}
              <Route
                path="/random"
                element={<RandomNumberView />}
              />
            </Routes>
            </ErrorBoundary>
          </main>
        </div>

        {/* 移动端抽屉 */}
        {isMobile && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            games={games}
            onAddGame={handleAddGame}
          />
        )}

        {/* 游戏表单弹窗 */}
        <GameForm
          key={gameFormOpen ? 'open' : 'closed'}
          isOpen={gameFormOpen}
          onClose={() => setGameFormOpen(false)}
          onSubmit={handleGameFormSubmit}
          onAddPreset={handleAddPresetGame}
          onResetPresets={resetPresets}
          initialData={editingGame}
          existingGames={games}
        />

        {/* 版本表单弹窗 */}
        <VersionForm
          key={versionFormOpen ? 'open' : 'closed'}
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

      </div>
    </Router>
  );
};

export default App;
