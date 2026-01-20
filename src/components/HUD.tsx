import type { Weapon } from '../types/game';
import { MAX_HEALTH } from '../types/game';
import './HUD.css';

interface HUDProps {
  health: number;
  weapon: Weapon | null;
  turn: number;
  deckCount: number;
  discardCount: number;
  canAvoid: boolean;
  onNewGame: () => void;
  onRestart: () => void;
  onAvoid: () => void;
  onHelp: () => void;
}

export function HUD({
  health,
  weapon,
  turn,
  deckCount,
  discardCount,
  canAvoid,
  onNewGame,
  onRestart,
  onAvoid,
  onHelp,
}: HUDProps) {
  const healthPct = Math.round((health / MAX_HEALTH) * 100);

  return (
    <header className="hud" aria-label="Game Heads-up Display">
      <div className="hud-row">
        <div className="hud-group health" aria-label="Health">
          <div className="label">Health</div>
          <div
            className="health-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MAX_HEALTH}
            aria-valuenow={health}
            aria-label="Health points"
          >
            <div className="health-fill" style={{ width: `${healthPct}%` }} />
          </div>
          <div className="health-value">{health} / {MAX_HEALTH}</div>
        </div>

        <div className="hud-group weapon" aria-label="Equipped Weapon">
          <div className="label">Weapon</div>
          <div className="weapon-info">
            <span>{weapon ? `♦${weapon.value}` : '—'}</span>
            <span className="sep">•</span>
            <span>Last defeated:</span>
            <span>{weapon?.lastDefeated ?? '—'}</span>
            <span className="sep">•</span>
            <span>Stack:</span>
            <span>{weapon?.stack ?? 0}</span>
          </div>
        </div>

        <div className="hud-group stats" aria-label="Deck and Turn Stats">
          <div className="stat">
            <span className="label">Turn</span> <span>{turn}</span>
          </div>
          <div className="stat">
            <span className="label">Deck</span> <span>{deckCount}</span>
          </div>
          <div className="stat">
            <span className="label">Discard</span> <span>{discardCount}</span>
          </div>
        </div>

        <div className="hud-group controls" aria-label="Primary Controls">
          <button className="btn primary" onClick={onNewGame} aria-label="Start a new game">
            New Game
          </button>
          <button className="btn" onClick={onRestart} aria-label="Restart the current game">
            Restart
          </button>
          <button
            className="btn"
            onClick={onAvoid}
            disabled={!canAvoid}
            aria-label="Avoid this room"
          >
            Avoid
          </button>
          <button className="btn" onClick={onHelp} aria-label="Open help and rules">
            Help
          </button>
        </div>
      </div>

      <div className="hud-row subtle">
        <div className="hud-group avoid-state" aria-live="polite">
          <span>{canAvoid ? 'Avoid available' : 'Avoid unavailable'}</span>
        </div>
      </div>
    </header>
  );
}
