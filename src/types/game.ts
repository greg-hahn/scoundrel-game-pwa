import type { Card } from '../utils/deck';

export interface Weapon {
  value: number;
  lastDefeated: number;
  stack: number;
  cardId: string;
}

export interface DebugState {
  seed: string | null;
  showDeck: boolean;
}

export interface GameState {
  health: number;
  turn: number;
  deck: Card[];
  discard: Card[];
  room: Card[];
  carried: Card | null;
  weapon: Weapon | null;
  potionUsedThisRoom: boolean;
  avoidedLastTurn: boolean;
  debug: DebugState;
  over: boolean;
  winner: boolean | null;
  score: number;
  roomInitialCount: number;
  roomResolvedCount: number;
}

export interface LogEntry {
  id: number;
  message: string;
  kind: 'info' | 'warn' | 'danger' | 'success' | 'turn' | 'header';
}

export const MAX_HEALTH = 20;
export const MAX_LAST_DEFEATED = 14; // Ace; allows any monster at start
