// deck.ts — deck building and shuffle

/** Suits */
export const SUITS = {
  CLUBS: "♣",
  DIAMONDS: "♦",
  HEARTS: "♥",
  SPADES: "♠",
} as const;

export type Suit = typeof SUITS[keyof typeof SUITS];

export interface Card {
  id: string;
  suit: Suit;
  rank: string;
  value: number;
  type: 'monster' | 'weapon' | 'potion';
  resolved?: boolean;
}

/** Rank to numeric value */
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export function rankToValue(rank: string): number {
  if (/^\d+$/.test(rank)) return parseInt(rank, 10);
  switch (rank) {
    case "J": return 11;
    case "Q": return 12;
    case "K": return 13;
    case "A": return 14;
  }
  return 0;
}

export function cardType(suit: Suit, rank: string): 'monster' | 'weapon' | 'potion' | 'removed' {
  const value = rankToValue(rank);
  if (suit === SUITS.HEARTS) {
    // Only 2-10 hearts remain; these are potions.
    return value >= 2 && value <= 10 ? "potion" : "removed";
  }
  if (suit === SUITS.DIAMONDS) {
    // Only 2-10 diamonds remain; these are weapons.
    return value >= 2 && value <= 10 ? "weapon" : "removed";
  }
  if (suit === SUITS.CLUBS || suit === SUITS.SPADES) {
    // All clubs/spades are monsters 2-10, J,Q,K,A (11-14)
    return "monster";
  }
  return "removed";
}

/** Build the 44-card Scoundrel deck per rules */
export function buildDeck(): Card[] {
  const baseSuits: Suit[] = [SUITS.CLUBS, SUITS.DIAMONDS, SUITS.HEARTS, SUITS.SPADES];
  const deck: Card[] = [];
  for (const suit of baseSuits) {
    for (const rank of RANKS) {
      const type = cardType(suit, rank);
      if (type === "removed") continue;
      const value = rankToValue(rank);
      deck.push({
        id: `${suit}${rank}`,
        suit,
        rank,
        value,
        type,
      });
    }
  }
  // Filter out red faces and red aces (explicitly safeguard)
  const filtered = deck.filter((c) => {
    if (c.suit === SUITS.HEARTS || c.suit === SUITS.DIAMONDS) {
      return c.value >= 2 && c.value <= 10;
    }
    return true;
  });
  return filtered;
}

/** Mulberry32 PRNG */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle; accepts optional PRNG fn */
export function shuffle(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Pretty format card */
export function formatCard(card: Card): string {
  return `${card.suit}${card.rank}`;
}

/** Debug: dump deck */
export function dumpDeck(deck: Card[]): string {
  return deck.map(formatCard).join("\n");
}
