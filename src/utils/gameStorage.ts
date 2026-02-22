import { Guess, KeyColorMap } from '../hooks/usePharmdle';

const STORAGE_KEY = 'pharmdle-state';

export interface PersistedGameState {
  solution: string;
  guesses: Guess[];
  isCorrect: boolean;
  usedKeys: KeyColorMap;
  revealedHints: string[];
}

export function loadGameState(): PersistedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: PersistedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable; silently fail
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
