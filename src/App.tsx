import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { MobileDrawer } from './components/Layout/MobileDrawer';
import { TimelineView } from './components/Timeline/TimelineView';
import { GameList } from './components/Game/GameList';
import { GameForm } from './components/Game/GameForm';
import { VersionForm } from './components/Version/VersionForm';
import { VersionDetail } from './components/Version/VersionDetail';
import { RandomNumberView } from './components/RandomNumber/RandomNumberView';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { ShaderBackground } from './components/Common/HeroShader';
import { useGames } from './hooks/useGames';
import { useVersions } from './hooks/useVersions';
import { useResponsive } from './hooks/useResponsive';
import type { Game, Version, GameFormData, VersionFormData } from './types';

const App: React.FC = () => {
  const { isMobile } = useResponsive();
  const { games, addGame, updateGame, deleteGame, addPresetGame, resetPresets } = useGames();
  const { versions, addVersion, updateVersion, deleteVersion, syncFromMihoyo } = useVersions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();
  const [versionFormOpen, setVersionFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | undefined>();
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [versionDetailOpen, setVersionDetailOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const getGame = useCallback(
    (gameId: string) => games.find((g) => g.id === gameId),
    [games]
  );

  const handleAddGame = useCallback(() => {
    setEditingGame(undefined);
    setGameFormOpen(true);
  }, []);

  const handleEditGame = useCallback((game: Game) => {
    setEditingGame(game);
    setGameFormOpen(true);
  }, []);

  const handleDeleteGame = useCallback(
    (game: Game) => {
      if (window.confirm(`确定要删除游戏 "${game.name}" 吗？相关的版本数据也会被删除。`)) {
        deleteGame(game.id);
      }
    },
    [deleteGame]
  );

  const handleGameFormSubmit = useCallback(
    (data: GameFormData) => {
      if (editingGame) {
        updateGame(editingGame.id, data);
      } else {
        addGame(data);
      }
    },
    [editingGame, addGame, updateGame]
  );

  const handleAddPresetGame = useCallback(
    (gameId: string) => {
      addPresetGame(gameId);
    },
    [addPresetGame]
  );

  const handleEditVersion = useCallback((version: Version) => {
    setSelectedGameId(version.gameId);
    setEditingVersion(version);
    setVersionFormOpen(true);
  }, []);

  const handleDeleteVersion = useCallback(
    (version: Version) => {
      if (window.confirm(`确定要删除版本 v${version.version} 吗？`)) {
        deleteVersion(version.id);
      }
    },
    [deleteVersion]
  );

  const handleVersionFormSubmit = useCallback(
    (data: VersionFormData) => {
      if (editingVersion) {
        updateVersion(editingVersion.id, data);
      } else {
        addVersion(data, selectedGameId);
      }
    },
    [editingVersion, selectedGameId, addVersion, updateVersion]
  );

  const handleVersionClick = useCallback((version: Version) => {
    setSelectedVersion(version);
    setVersionDetailOpen(true);
  }, []);

  useEffect(() => {
    const autoSync = async () => {
      if (games.length === 0) return;

      for (const game of games) {
        if (game.autoFetch) {
          try {
            await syncFromMihoyo(game.id);
          } catch {
            // silent
          }
        }
      }
    };

    autoSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router basename="/ChronoRail">
      <div className="h-screen flex flex-col bg-ink relative">
        <ShaderBackground />
        <Header
          onMenuToggle={() => setDrawerOpen(true)}
        />

        <main className="flex-1 overflow-hidden relative z-10">
          <ErrorBoundary>
            <Routes>
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
              <Route
                path="/random"
                element={<RandomNumberView />}
              />
            </Routes>
          </ErrorBoundary>
        </main>

        {isMobile && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            games={games}
            onAddGame={handleAddGame}
          />
        )}

        <GameForm
          key={gameFormOpen ? 'game-form-open' : 'game-form-closed'}
          isOpen={gameFormOpen}
          onClose={() => setGameFormOpen(false)}
          onSubmit={handleGameFormSubmit}
          onAddPreset={handleAddPresetGame}
          onResetPresets={resetPresets}
          initialData={editingGame}
          existingGames={games}
        />

        <VersionForm
          key={versionFormOpen ? 'version-form-open' : 'version-form-closed'}
          isOpen={versionFormOpen}
          onClose={() => setVersionFormOpen(false)}
          onSubmit={handleVersionFormSubmit}
          initialData={editingVersion}
          gameName={getGame(selectedGameId)?.name || ''}
        />

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
