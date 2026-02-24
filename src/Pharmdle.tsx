import React, { useEffect, useRef, useState } from 'react';
import PharmdleRow from './PharmdleRow';
import { Stack } from '@mui/material';
import usePharmdle, { InitialGameState } from './hooks/usePharmdle';
import Keypad from './Keypad';
import LostGameModal from './components/LostGameModal';
import WonGameModal from './components/WonGameModal';
import HintsDrawer from './components/HintsDrawer';
import validDrugs from './data/validDrugs';
import { loadGameState, saveGameState, clearGameState } from './utils/gameStorage';
import { trackEvent } from './utils/analytics';

export interface PharmdleGridProps {
  numRows: number;
}

interface ResolvedState {
  solution: string;
  hints: Record<string, string[]>;
  initialGameState?: InitialGameState;
  initialRevealedHints: Set<string>;
  initialStartTime?: number;
  resumed: boolean;
}

const Pharmdle = ({ numRows }: PharmdleGridProps) => {
  const [resolved, setResolved] = useState<ResolvedState | null>(null);

  useEffect(() => {
    const fetchAndResolve = async () => {
      const fetchStart = performance.now();
      let success = true;
      try {
        const response = await fetch(
          'https://5bpsqzakript5dai5nolgdvv6e0tkmbr.lambda-url.us-east-1.on.aws/?hints=true'
        );
        const data = await response.json();
        const latency = Math.round(performance.now() - fetchStart);
        trackEvent('api_fetch', { latency_ms: latency, success: true });

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
            initialStartTime: saved.startTime,
            resumed: true,
          });
        } else {
          clearGameState();
          setResolved({
            solution: todaySolution,
            hints: hintData,
            initialRevealedHints: new Set(),
            resumed: false,
          });
        }
      } catch {
        success = false;
        const latency = Math.round(performance.now() - fetchStart);
        trackEvent('api_fetch', { latency_ms: latency, success: false });
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
      initialStartTime={resolved.initialStartTime}
      resumed={resolved.resumed}
    />
  );
};

interface PharmdleGameProps {
  numRows: number;
  solution: string;
  hints: Record<string, string[]>;
  initialGameState?: InitialGameState;
  initialRevealedHints: Set<string>;
  initialStartTime?: number;
  resumed: boolean;
}

const PharmdleGame = ({
  numRows,
  solution: initialSolution,
  hints,
  initialGameState,
  initialRevealedHints,
  initialStartTime,
  resumed,
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
  const [startTime, setStartTime] = useState<number | undefined>(initialStartTime);

  const hintsUsed = revealedHints.size;

  // Track how many guesses were restored (so we only fire events for new ones)
  const initialGuessCount = useRef(initialGameState?.guesses.length ?? 0);
  const gameEndTracked = useRef(initialGameState?.isCorrect === true || (initialGameState?.guesses.length ?? 0) >= 6);

  useEffect(() => {
    setSolution(initialSolution);
  }, [initialSolution, setSolution]);

  // Track game_start once on mount
  useEffect(() => {
    trackEvent('game_start', { resumed });
  }, [resumed]);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup]);

  // Track new guesses (skip restored ones)
  useEffect(() => {
    if (guesses.length > initialGuessCount.current) {
      trackEvent('guess_submitted', { guess_number: guesses.length });

      // Record start time on first guess
      if (guesses.length === 1 && !startTime) {
        setStartTime(Date.now());
      }
    }
  }, [guesses.length]);

  // Track game won
  useEffect(() => {
    if (isCorrect && !gameEndTracked.current) {
      gameEndTracked.current = true;
      const timeToComplete = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : undefined;
      trackEvent('game_won', {
        guess_number: guesses.length,
        hints_used: hintsUsed,
        ...(timeToComplete !== undefined && { time_to_complete_s: timeToComplete }),
      });
    }
  }, [isCorrect]);

  // Track game lost
  useEffect(() => {
    if (guesses.length === 6 && !isCorrect && !gameEndTracked.current) {
      gameEndTracked.current = true;
      const timeToComplete = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : undefined;
      trackEvent('game_lost', {
        hints_used: hintsUsed,
        ...(timeToComplete !== undefined && { time_to_complete_s: timeToComplete }),
      });
    }
  }, [guesses.length, isCorrect]);

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
      startTime,
    });
  }, [solution, guesses, isCorrect, usedKeys, revealedHints, startTime]);

  const handleHintReveal = (hintKey: string) => {
    if (revealedHints.has(hintKey)) return;
    const updated = new Set(revealedHints);
    updated.add(hintKey);
    setRevealedHints(updated);
    trackEvent('hint_revealed', {
      hint_category: hintKey,
      hints_total: updated.size,
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
