import { useState } from 'react';
import type { Card } from '../utils/deck';
import { dumpDeck } from '../utils/deck';
import './DebugPanel.css';

interface DebugPanelProps {
  seed: string | null;
  showDeck: boolean;
  deck: Card[];
  onToggleDeck: () => void;
  onApplySeed: (seed: string) => void;
}

export function DebugPanel({
  seed,
  showDeck,
  deck,
  onToggleDeck,
  onApplySeed,
}: DebugPanelProps) {
  const [seedInput, setSeedInput] = useState(seed ?? '');

  return (
    <section className="debug">
      <div className="debug-header">
        <div className="label">Debug</div>
        <div className="debug-controls">
          <label>
            <input
              type="checkbox"
              checked={showDeck}
              onChange={onToggleDeck}
            />{' '}
            Show deck order
          </label>
          <label>
            Seed:{' '}
            <input
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </label>
          <button
            className="btn small"
            onClick={() => onApplySeed(seedInput)}
          >
            Apply Seed
          </button>
        </div>
      </div>
      {showDeck && (
        <div className="debug-body">
          <pre className="deck-dump">{dumpDeck(deck)}</pre>
        </div>
      )}
    </section>
  );
}
