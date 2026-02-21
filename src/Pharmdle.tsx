import React, { useEffect, useState } from 'react';
import PharmdleRow from './PharmdleRow';
import { Stack } from '@mui/material';
import usePharmdle from './hooks/usePharmdle';
import Keypad from './Keypad';
import LostGameModal from './components/LostGameModal';
import WonGameModal from './components/WonGameModal';
import HintsDrawer from './components/HintsDrawer';
import validDrugs from './data/validDrugs';

export interface PharmdleGridProps {
  numRows: number;
}

const Pharmdle = ({ numRows }: PharmdleGridProps) => {
  const {
    currentGuess,
    guesses,
    isCorrect,
    usedKeys,
    handleKeyup,
    setSolution,
    solution,
    message,
  } = usePharmdle(8, validDrugs);

  const [modalCleared, setModalCleared] = useState(false);
  const [hints, setHints] = useState<Record<string, string[]> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    const fetchDailyDrug = async () => {
      const response = await fetch(
        'https://5bpsqzakript5dai5nolgdvv6e0tkmbr.lambda-url.us-east-1.on.aws/?hints=true'
      );
      const data = await response.json();
      console.log('fetched drug:', data.name);
      setSolution(data.name.toLowerCase());
      const { name, ...hintData } = data;
      setHints(hintData);
    };

    fetchDailyDrug();
  }, []);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup]);

  // console.log(
  //   `turn: ${guesses.length}, currentGuess: ${currentGuess}, guesses: ${guesses}, usedKeys: ${usedKeys}, isCorrect: ${isCorrect}`
  // );

  // Close hints drawer when game ends
  useEffect(() => {
    if (isCorrect || guesses.length === 8) {
      setDrawerOpen(false);
    }
  }, [isCorrect, guesses.length]);

  if (!solution) {
    return <div>Loading...</div>;
  }

  const shouldShowWonGameModal = () => {
    return isCorrect && guesses.length <= 8 && !modalCleared;
  };

  const shouldShowLostGameModal = () => {
    return guesses.length === 8 && !isCorrect;
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
        onReveal={(count) => setHintsUsed(count)}
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
