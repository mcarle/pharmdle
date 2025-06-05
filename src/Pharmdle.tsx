import React, { use, useEffect, useState } from 'react';
import PharmdleRow from './PharmdleRow';
import { Box, Button, Modal, Stack, Typography } from '@mui/material';
import usePharmdle from './hooks/usePharmdle';
import Keypad from './Keypad';
import LostGameModal from './components/LostGameModal';

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
  } = usePharmdle(8);

  const [modalCleared, setModalCleared] = useState(false);

  useEffect(() => {
    const fetchDailyDrug = async () => {
      const response = await fetch(
        'https://5bpsqzakript5dai5nolgdvv6e0tkmbr.lambda-url.us-east-1.on.aws/'
      );
      const drug = await response.text();
      console.log('fetched drug:', drug);
      setSolution(drug.padEnd(14, '*'));
    };

    fetchDailyDrug();
  }, []);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup]);

  console.log(
    `turn: ${guesses.length}, currentGuess: ${currentGuess}, guesses: ${guesses}, usedKeys: ${usedKeys}, isCorrect: ${isCorrect}`
  );

  if (!solution) {
    return <div>Loading...</div>;
  }

  const shouldShowLostGameModal = () => {
    return guesses.length === 8 && !isCorrect;
  };

  return (
    <div>
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
      <Keypad usedKeys={usedKeys} />
      <LostGameModal
        open={shouldShowLostGameModal() && !modalCleared}
        solution={solution}
        onClose={() => setModalCleared(true)}
      />
    </div>
  );
};

export default Pharmdle;
