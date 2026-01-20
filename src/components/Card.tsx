import { useState, useEffect } from 'react';
import type { Card } from '../utils/deck';
import { SUITS, formatCard } from '../utils/deck';
import './Card.css';

interface CardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

function getSuitColor(suit: string): string {
  if (suit === SUITS.HEARTS) return 'var(--heart)';
  if (suit === SUITS.DIAMONDS) return 'var(--diamond)';
  return 'var(--club-spade)';
}

function getArtSrc(card: Card): string | null {
  try {
    if (card.suit === SUITS.HEARTS && card.type === 'potion') {
      return '/assets/heart.jpg';
    }
    if (card.suit === SUITS.DIAMONDS && card.type === 'weapon') {
      if (card.value >= 2 && card.value <= 4) return '/assets/diamond-1.jpg';
      if (card.value >= 5 && card.value <= 7) return '/assets/diamond-2.jpg';
      if (card.value >= 8 && card.value <= 10) return '/assets/diamond-3.jpg';
      return null;
    }
    if (card.suit === SUITS.CLUBS && card.type === 'monster') {
      if (card.value >= 2 && card.value <= 5) return '/assets/club-1.jpg';
      if (card.value >= 6 && card.value <= 10) return '/assets/club-2.jpg';
      if (card.value >= 11 && card.value <= 14) return '/assets/club-3.jpg';
      return null;
    }
    if (card.suit === SUITS.SPADES && card.type === 'monster') {
      if (card.value >= 2 && card.value <= 5) return '/assets/spade-1.jpg';
      if (card.value >= 6 && card.value <= 10) return '/assets/spade-2.jpg';
      if (card.value >= 11 && card.value <= 14) return '/assets/spade-3.jpg';
      return null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export function CardComponent({ card, onClick, disabled }: CardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    // Flip animation on mount
    const timer = setTimeout(() => setFlipped(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const artSrc = getArtSrc(card);
  const ariaLabel = `${card.type.charAt(0).toUpperCase() + card.type.slice(1)} ${card.suit}${card.rank} value ${card.value}`;

  return (
    <div
      className={`card ${card.type} ${flipped ? 'flipped' : ''}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => !disabled && onClick()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {artSrc && (
        <img className="art" src={artSrc} alt="" aria-hidden="true" />
      )}

      <div className="inner">
        <div className="top">
          <div className="suit" style={{ color: getSuitColor(card.suit) }}>
            {card.suit}
          </div>
          <div className="type">
            {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
          </div>
        </div>

        <div className="center">
          <div className="rank">{card.rank}</div>
        </div>

        <div className="footer">
          <div>Value {card.value}</div>
          <div>{formatCard(card)}</div>
        </div>
      </div>

      <div className="back">SCND</div>
    </div>
  );
}
