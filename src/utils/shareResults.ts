import { Guess } from '../hooks/usePharmdle';

export function generateShareText(guesses: Guess[], hintsUsed: number, isWin: boolean): string {
  const header = isWin
    ? `Pharmdle ${guesses.length}/6`
    : `Pharmdle X/6`;
  const hintText =
    hintsUsed === 0 ? '' : hintsUsed === 1 ? ' (1 hint)' : ` (${hintsUsed} hints)`;
  const grid = guesses
    .map((g) =>
      g.formatted
        .map((tile) => {
          if (tile.color === 'green') return '🟩';
          if (tile.color === 'yellow') return '🟨';
          return '⬜';
        })
        .join('')
    )
    .join('\n');
  return `${header}${hintText}\n\n${grid}\n\nhttps://pharmdle.com`;
}
