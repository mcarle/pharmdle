import React, { useEffect, useState } from 'react';
import PharmdleRow from './PharmdleRow';
import { Stack } from '@mui/material';
import usePharmdle, { InitialGameState } from './hooks/usePharmdle';
import Keypad from './Keypad';
import LostGameModal from './components/LostGameModal';
import WonGameModal from './components/WonGameModal';
import HintsDrawer from './components/HintsDrawer';
import validDrugs from './data/validDrugs';
import { loadGameState, saveGameState, clearGameState } from './utils/gameStorage';

export interface PharmdleGridProps {
  numRows: number;
}

interface ResolvedState {
  solution: string;
  hints: Record<string, string[]>;
  initialGameState?: InitialGameState;
  initialRevealedHints: Set<string>;
}

const Pharmdle = ({ numRows }: PharmdleGridProps) => {
  const [resolved, setResolved] = useState<ResolvedState | null>(null);

  useEffect(() => {
    const fetchAndResolve = async () => {
      const response = await fetch(
        'https://5bpsqzakript5dai5nolgdvv6e0tkmbr.lambda-url.us-east-1.on.aws/?hints=true'
      );
      const data = await response.json();
      console.log('fetched drug:', data.name);
      const todaySolution = data.name.toLowerCase();
      const { name, ...hintData } = data;

      const saved = loadGameState();

      if (saved && saved.solution === todaySolution) {
        setResolved({
          solution: todaySolution,
          hints: hintData,
          initialGameState: {
            guesses: saved.guesses,
            isCorrect: saved.isCorrect,
            usedKeys: saved.usedKeys,
          },
          initialRevealedHints: new Set(saved.revealedHints),
        });
      } else {
        clearGameState();
        setResolved({
          solution: todaySolution,
          hints: hintData,
          initialRevealedHints: new Set(),
        });
      }
    };

    fetchAndResolve();
  }, []);

  if (!resolved) {
    return <div>Loading...</div>;
  }

  return (
    <PharmdleGame
      numRows={numRows}
      solution={resolved.solution}
      hints={resolved.hints}
      initialGameState={resolved.initialGameState}
      initialRevealedHints={resolved.initialRevealedHints}
    />
  );
};

interface PharmdleGameProps {
  numRows: number;
  solution: string;
  hints: Record<string, string[]>;
  initialGameState?: InitialGameState;
  initialRevealedHints: Set<string>;
}

const PharmdleGame = ({
  numRows,
  solution: initialSolution,
  hints,
  initialGameState,
  initialRevealedHints,
}: PharmdleGameProps) => {
  const {
    currentGuess,
    guesses,
    isCorrect,
    usedKeys,
    handleKeyup,
    setSolution,
    solution,
    message,
  } = usePharmdle(6, validDrugs, initialGameState);

  const [modalCleared, setModalCleared] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(initialRevealedHints);

  const hintsUsed = revealedHints.size;

  useEffect(() => {
    setSolution(initialSolution);
  }, [initialSolution, setSolution]);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup]);

  // Close hints drawer when game ends
  useEffect(() => {
    if (isCorrect || guesses.length === 6) {
      setDrawerOpen(false);
    }
  }, [isCorrect, guesses.length]);

  // Persist game state to localStorage
  useEffect(() => {
    if (!solution) return;
    saveGameState({
      solution,
      guesses,
      isCorrect,
      usedKeys,
      revealedHints: Array.from(revealedHints),
    });
  }, [solution, guesses, isCorrect, usedKeys, revealedHints]);

  const handleHintReveal = (hintKey: string) => {
    setRevealedHints((prev) => {
      const updated = new Set(prev);
      updated.add(hintKey);
      return updated;
    });
  };

  const shouldShowWonGameModal = () => {
    return isCorrect && guesses.length <= 6 && !modalCleared;
  };

  const shouldShowLostGameModal = () => {
    return guesses.length === 6 && !isCorrect;
  };

  return (
    <div>
      {message && <div className="message-toast">{message}</div>}
      <Stack spacing={2}>
        {Array.from({ length: numRows }, (_, index) => (
          <PharmdleRow
            key={index}
            numCols={14}
            existingGuess={guesses[index]}
            guessInProgress={index === guesses.length ? currentGuess : ''}
          />
        ))}
      </Stack>
      <Keypad usedKeys={usedKeys} onKeyClick={(key) => handleKeyup({ key })} />
      <HintsDrawer
        hints={hints}
        open={drawerOpen}
        onToggle={() => setDrawerOpen(!drawerOpen)}
        revealedHints={revealedHints}
        onReveal={handleHintReveal}
      />
      <LostGameModal
        open={shouldShowLostGameModal() && !modalCleared}
        solution={solution}
        onClose={() => setModalCleared(true)}
        hintsUsed={hintsUsed}
      />
      <WonGameModal
        open={shouldShowWonGameModal() && !modalCleared}
        solution={solution}
        onClose={() => setModalCleared(true)}
        numGuesses={guesses.length}
        hintsUsed={hintsUsed}
      />
    </div>
  );
};

export default Pharmdle;
