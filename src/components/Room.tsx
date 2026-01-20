import type { Card } from '../utils/deck';
import { CardComponent } from './Card';
import './Room.css';

interface RoomProps {
  cards: Card[];
  onCardClick: (index: number) => void;
  disabled: boolean;
}

export function Room({ cards, onCardClick, disabled }: RoomProps) {
  return (
    <div className="room-grid" id="roomGrid">
      {cards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          onClick={() => onCardClick(index)}
          disabled={disabled || card.resolved === true}
        />
      ))}
    </div>
  );
}
