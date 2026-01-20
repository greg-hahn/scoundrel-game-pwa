import { useReducer, useCallback } from 'react';
import { buildDeck, shuffle, mulberry32, formatCard, type Card } from '../utils/deck';
import { saveInitial, saveState, loadState, clearState, loadInitial } from '../utils/storage';
import type { GameState, LogEntry } from '../types/game';
import { MAX_HEALTH, MAX_LAST_DEFEATED } from '../types/game';

function defaultState(): GameState {
  return {
    health: MAX_HEALTH,
    turn: 1,
    deck: [],
    discard: [],
    room: [],
    carried: null,
    weapon: null,
    potionUsedThisRoom: false,
    avoidedLastTurn: false,
    debug: { seed: null, showDeck: false },
    over: false,
    winner: null,
    score: 0,
    roomInitialCount: 0,
    roomResolvedCount: 0,
  };
}

type GameAction =
  | { type: 'START_NEW_GAME'; seed?: string | null }
  | { type: 'RESTART_GAME' }
  | { type: 'RESTORE_STATE'; state: GameState }
  | { type: 'START_ROOM' }
  | { type: 'AVOID_ROOM' }
  | { type: 'END_TURN' }
  | { type: 'RESOLVE_CARD'; index: number }
  | { type: 'END_GAME'; won: boolean }
  | { type: 'TOGGLE_DEBUG_DECK' };

interface GameStateWithLogs {
  game: GameState;
  logs: LogEntry[];
  logIdCounter: number;
}

function addLog(
  logs: LogEntry[],
  counter: number,
  message: string,
  kind: LogEntry['kind'] = 'info'
): { logs: LogEntry[]; counter: number } {
  return {
    logs: [...logs, { id: counter, message, kind }],
    counter: counter + 1,
  };
}

function gameReducer(
  state: GameStateWithLogs,
  action: GameAction
): GameStateWithLogs {
  const { game, logs, logIdCounter } = state;

  switch (action.type) {
    case 'START_NEW_GAME': {
      const newGame = defaultState();
      const deck = buildDeck();
      const rng = action.seed != null && action.seed !== ''
        ? mulberry32(Number(action.seed) || 0)
        : Math.random;
      newGame.deck = shuffle(deck, rng);
      newGame.debug.seed = action.seed != null && action.seed !== '' ? String(action.seed) : null;
      
      clearState();
      saveInitial({ seed: newGame.debug.seed });

      let newLogs: LogEntry[] = [];
      let counter = 1;

      const headerResult = addLog(newLogs, counter, '— New Game —', 'header');
      newLogs = headerResult.logs;
      counter = headerResult.counter;

      const infoResult = addLog(newLogs, counter, 'New game started.', 'info');
      newLogs = infoResult.logs;
      counter = infoResult.counter;

      // Start the first room
      const room: Card[] = [];
      while (room.length < 4 && newGame.deck.length > 0) {
        room.push({ ...newGame.deck.shift()!, resolved: false });
      }
      newGame.room = room;
      newGame.roomInitialCount = room.length;
      newGame.roomResolvedCount = 0;
      newGame.potionUsedThisRoom = false;

      const turnResult = addLog(newLogs, counter, `— Turn ${newGame.turn} —`, 'turn');
      newLogs = turnResult.logs;
      counter = turnResult.counter;

      const roomResult = addLog(newLogs, counter, `Room revealed (${room.length} cards).`, 'info');
      newLogs = roomResult.logs;
      counter = roomResult.counter;

      const ids = room.map(formatCard).join(', ');
      const cardsResult = addLog(newLogs, counter, `Room cards: ${ids}.`, 'info');
      newLogs = cardsResult.logs;
      counter = cardsResult.counter;

      saveState(newGame);

      return { game: newGame, logs: newLogs, logIdCounter: counter };
    }

    case 'RESTART_GAME': {
      const init = loadInitial();
      const savedSeed = init?.seed ?? null;
      return gameReducer(
        { game: defaultState(), logs: [], logIdCounter: 1 },
        { type: 'START_NEW_GAME', seed: savedSeed }
      );
    }

    case 'RESTORE_STATE': {
      let newLogs = logs;
      let counter = logIdCounter;
      const result = addLog(newLogs, counter, 'State restored.', 'info');
      return { game: action.state, logs: result.logs, logIdCounter: result.counter };
    }

    case 'AVOID_ROOM': {
      if (game.over || game.avoidedLastTurn || game.room.length === 0) {
        return state;
      }

      const ids = game.room.map(formatCard).join(', ');
      let newLogs = logs;
      let counter = logIdCounter;
      
      const avoidResult = addLog(newLogs, counter, `Avoided room: ${ids}. Placed on bottom.`, 'warn');
      newLogs = avoidResult.logs;
      counter = avoidResult.counter;

      const newGame = { ...game };
      // Place all cards on bottom
      newGame.deck = [
        ...game.deck,
        ...game.room.map((c) => ({ ...c, resolved: false })),
      ];
      newGame.room = [];
      newGame.turn += 1;
      newGame.avoidedLastTurn = true;
      newGame.carried = null;

      // Start new room
      const room: Card[] = [];
      while (room.length < 4 && newGame.deck.length > 0) {
        room.push({ ...newGame.deck.shift()!, resolved: false });
      }
      newGame.room = room;
      newGame.roomInitialCount = room.length;
      newGame.roomResolvedCount = 0;
      newGame.potionUsedThisRoom = false;

      const turnResult = addLog(newLogs, counter, `— Turn ${newGame.turn} —`, 'turn');
      newLogs = turnResult.logs;
      counter = turnResult.counter;

      const roomResult = addLog(newLogs, counter, `Room revealed (${room.length} cards).`, 'info');
      newLogs = roomResult.logs;
      counter = roomResult.counter;

      saveState(newGame);
      return { game: newGame, logs: newLogs, logIdCounter: counter };
    }

    case 'END_TURN': {
      const newGame = { ...game };
      let newLogs = logs;
      let counter = logIdCounter;

      // Carry the remaining unresolved card forward
      const remaining = game.room.filter((c) => !c.resolved);
      if (remaining.length === 1) {
        newGame.carried = remaining[0];
        const carryResult = addLog(newLogs, counter, `Carry forward ${formatCard(remaining[0])}.`, 'info');
        newLogs = carryResult.logs;
        counter = carryResult.counter;
      } else {
        newGame.carried = null;
      }

      newGame.room = [];
      newGame.turn += 1;
      newGame.avoidedLastTurn = false;

      // If no cards left anywhere, win
      if (newGame.deck.length === 0 && !newGame.carried) {
        newGame.over = true;
        newGame.winner = true;
        newGame.score = newGame.health;
        saveState(newGame);
        return { game: newGame, logs: newLogs, logIdCounter: counter };
      }

      // Start new room
      const room: Card[] = [];
      const carriedEntering = newGame.carried ? { ...newGame.carried } : null;
      if (newGame.carried) {
        room.push({ ...newGame.carried, resolved: false });
        newGame.carried = null;
      }
      while (room.length < 4 && newGame.deck.length > 0) {
        room.push({ ...newGame.deck.shift()!, resolved: false });
      }
      newGame.room = room;
      newGame.roomInitialCount = room.length;
      newGame.roomResolvedCount = 0;
      newGame.potionUsedThisRoom = false;

      const turnResult = addLog(newLogs, counter, `— Turn ${newGame.turn} —`, 'turn');
      newLogs = turnResult.logs;
      counter = turnResult.counter;

      const roomResult = addLog(newLogs, counter, `Room revealed (${room.length} cards).`, 'info');
      newLogs = roomResult.logs;
      counter = roomResult.counter;

      const ids = room.map(formatCard).join(', ');
      const cardsResult = addLog(newLogs, counter, `Room cards: ${ids}.`, 'info');
      newLogs = cardsResult.logs;
      counter = cardsResult.counter;

      if (carriedEntering) {
        const carriedResult = addLog(newLogs, counter, `Carried in: ${formatCard(carriedEntering)}.`, 'info');
        newLogs = carriedResult.logs;
        counter = carriedResult.counter;
      }

      saveState(newGame);
      return { game: newGame, logs: newLogs, logIdCounter: counter };
    }

    case 'RESOLVE_CARD': {
      if (game.over) return state;

      const card = game.room[action.index];
      if (!card || card.resolved) return state;

      const newGame = { ...game };
      newGame.room = [...game.room];
      newGame.deck = [...game.deck];
      newGame.discard = [...game.discard];

      let newLogs = logs;
      let counter = logIdCounter;

      // Resolve card by type
      if (card.type === 'weapon') {
        // Equip weapon
        if (newGame.weapon) {
          newGame.discard.push({
            type: 'weapon',
            value: newGame.weapon.value,
            id: newGame.weapon.cardId,
          } as unknown as Card);
          for (let i = 0; i < newGame.weapon.stack; i++) {
            newGame.discard.push({ type: 'monster' } as unknown as Card);
          }
        }
        newGame.weapon = {
          value: card.value,
          lastDefeated: MAX_LAST_DEFEATED,
          stack: 0,
          cardId: card.id,
        };
        const equipResult = addLog(newLogs, counter, `Equipped ♦${card.value}.`, 'success');
        newLogs = equipResult.logs;
        counter = equipResult.counter;
      } else if (card.type === 'potion') {
        // Use potion
        if (!newGame.potionUsedThisRoom) {
          const newHealth = Math.min(MAX_HEALTH, newGame.health + card.value);
          const healed = newHealth - newGame.health;
          newGame.health = newHealth;
          newGame.potionUsedThisRoom = true;
          const potionResult = addLog(newLogs, counter, `Potion ♥${card.value} used. Healed ${healed}.`, 'success');
          newLogs = potionResult.logs;
          counter = potionResult.counter;
        } else {
          const discardResult = addLog(newLogs, counter, `Potion ♥${card.value} discarded (limit reached).`, 'warn');
          newLogs = discardResult.logs;
          counter = discardResult.counter;
        }
        newGame.discard.push({ type: 'potion', value: card.value, id: card.id } as unknown as Card);
      } else if (card.type === 'monster') {
        // Fight monster
        const canUseWeapon = !!newGame.weapon && card.value <= newGame.weapon.lastDefeated;
        if (canUseWeapon && newGame.weapon) {
          const damage = Math.max(0, card.value - newGame.weapon.value);
          if (damage <= 0) {
            newGame.weapon = {
              ...newGame.weapon,
              lastDefeated: card.value,
              stack: newGame.weapon.stack + 1,
            };
            const defeatResult = addLog(newLogs, counter, `Defeated ${card.suit}${card.rank} with ♦${newGame.weapon.value}.`, 'success');
            newLogs = defeatResult.logs;
            counter = defeatResult.counter;
          } else {
            newGame.health -= damage;
            newGame.discard.push({ type: 'monster', value: card.value, id: card.id } as unknown as Card);
            const damageResult = addLog(newLogs, counter, `Took ${damage} damage vs ${card.suit}${card.rank}.`, 'danger');
            newLogs = damageResult.logs;
            counter = damageResult.counter;
          }
        } else {
          newGame.health -= card.value;
          newGame.discard.push({ type: 'monster', value: card.value, id: card.id } as unknown as Card);
          const bareResult = addLog(newLogs, counter, `Sequence break — bare-handed vs ${card.suit}${card.rank}. Took ${card.value} damage.`, 'danger');
          newLogs = bareResult.logs;
          counter = bareResult.counter;
        }
      }

      // Mark card as resolved
      newGame.room[action.index] = { ...card, resolved: true };
      newGame.roomResolvedCount += 1;

      // Check for death
      if (newGame.health <= 0) {
        newGame.health = 0;
        newGame.over = true;
        newGame.winner = false;
        const remainingMonsters = newGame.deck.filter((c) => c.type === 'monster');
        const sum = remainingMonsters.reduce((acc, c) => acc + c.value, 0);
        newGame.score = -sum;
      }

      saveState(newGame);
      return { game: newGame, logs: newLogs, logIdCounter: counter };
    }

    case 'END_GAME': {
      const newGame = { ...game };
      newGame.over = true;
      newGame.winner = action.won;

      if (action.won) {
        newGame.score = newGame.health;
      } else {
        const remainingMonsters = newGame.deck.filter((c) => c.type === 'monster');
        const sum = remainingMonsters.reduce((acc, c) => acc + c.value, 0);
        newGame.score = -sum;
      }

      saveState(newGame);
      return { ...state, game: newGame };
    }

    case 'TOGGLE_DEBUG_DECK': {
      const newGame = {
        ...game,
        debug: { ...game.debug, showDeck: !game.debug.showDeck },
      };
      return { ...state, game: newGame };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, {
    game: defaultState(),
    logs: [],
    logIdCounter: 1,
  });

  const startNewGame = useCallback((seed?: string | null) => {
    dispatch({ type: 'START_NEW_GAME', seed });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);

  const restoreState = useCallback(() => {
    const saved = loadState();
    if (saved && saved.deck && Array.isArray(saved.deck)) {
      dispatch({ type: 'RESTORE_STATE', state: saved });
      return true;
    }
    return false;
  }, []);

  const avoidRoom = useCallback(() => {
    dispatch({ type: 'AVOID_ROOM' });
  }, []);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  const resolveCard = useCallback((index: number) => {
    dispatch({ type: 'RESOLVE_CARD', index });
  }, []);

  const toggleDebugDeck = useCallback(() => {
    dispatch({ type: 'TOGGLE_DEBUG_DECK' });
  }, []);

  const clearLogs = useCallback(() => {
    // This would need a separate action if we want to clear logs
  }, []);

  const canAvoid = !state.game.avoidedLastTurn && state.game.room.length > 0 && !state.game.over;
  const canEndTurn =
    state.game.room.length > 0 &&
    !state.game.over &&
    state.game.roomResolvedCount >= Math.min(3, state.game.roomInitialCount);

  return {
    game: state.game,
    logs: state.logs,
    startNewGame,
    restartGame,
    restoreState,
    avoidRoom,
    endTurn,
    resolveCard,
    toggleDebugDeck,
    clearLogs,
    canAvoid,
    canEndTurn,
  };
}
