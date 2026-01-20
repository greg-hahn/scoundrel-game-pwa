import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { HUD } from './HUD';
import { Room } from './Room';
import { ActionLog } from './ActionLog';
import { HelpModal } from './HelpModal';
import { GameOverModal } from './GameOverModal';
import { DebugPanel } from './DebugPanel';
import './Game.css';

export function Game() {
  const {
    game,
    logs,
    startNewGame,
    restartGame,
    restoreState,
    avoidRoom,
    endTurn,
    resolveCard,
    toggleDebugDeck,
    canAvoid,
    canEndTurn,
  } = useGameState();

  const [showHelp, setShowHelp] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const restored = restoreState();
      if (!restored) {
        startNewGame();
      }
    }
  }, [restoreState, startNewGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd' && e.shiftKey) {
        setShowDebug((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewGame = () => {
    startNewGame();
  };

  const handleRestart = () => {
    restartGame();
  };

  return (
    <div className="scoundrel-game">
      <HUD
        health={game.health}
        weapon={game.weapon}
        turn={game.turn}
        deckCount={game.deck.length}
        discardCount={game.discard.length}
        canAvoid={canAvoid}
        onNewGame={handleNewGame}
        onRestart={handleRestart}
        onAvoid={avoidRoom}
        onHelp={() => setShowHelp(true)}
      />

      <main className="board" aria-label="Room">
        <Room
          cards={game.room}
          onCardClick={resolveCard}
          disabled={game.over}
        />
        <div className="board-actions">
          <button
            className="btn"
            disabled={!canEndTurn}
            onClick={endTurn}
            aria-label="Finish resolving this room"
          >
            End Turn
          </button>
        </div>
      </main>

      <ActionLog logs={logs} />

      {showDebug && (
        <DebugPanel
          seed={game.debug.seed}
          showDeck={game.debug.showDeck}
          deck={game.deck}
          onToggleDeck={toggleDebugDeck}
          onApplySeed={(seed) => startNewGame(seed)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {game.over && (
        <GameOverModal
          won={game.winner ?? false}
          score={game.score}
          seed={game.debug.seed}
          onPlayAgain={handleNewGame}
          onRestart={handleRestart}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
