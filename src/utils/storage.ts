// storage.ts — localStorage helpers for Scoundrel
import type { GameState } from '../types/game';

const KEY_INITIAL = "scoundrel.initial";
const KEY_STATE = "scoundrel.state";

export interface InitialState {
  seed: string | null;
}

export function saveInitial(state: InitialState): void {
  try {
    localStorage.setItem(KEY_INITIAL, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadInitial(): InitialState | null {
  try {
    const raw = localStorage.getItem(KEY_INITIAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(KEY_STATE, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY_STATE);
  } catch {
    // Ignore storage errors
  }
}
