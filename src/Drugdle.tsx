import React, { use, useEffect, useState } from 'react';
import DrugdleRow from './DrugdleRow';
import { Stack } from '@mui/material';
import useDrugdle from './hooks/useDrugdle';
import Keypad from './Keypad';

export interface DrugdleGridProps {
  numRows: number;
}

const Drugdle = ({ numRows }: DrugdleGridProps) => {
  const {
    turn,
    currentGuess,
    guesses,
    isCorrect,
    usedKeys,
    handleKeyup,
    setSolution,
    solution,
  } = useDrugdle(8);

  useEffect(() => {
    const fetchDailyDrug = async () => {
      const response = await fetch(
        'https://5bpsqzakript5dai5nolgdvv6e0tkmbr.lambda-url.us-east-1.on.aws/'
      );
      const drug = await response.text();
      setSolution(drug.padEnd(14, '*'));
    };

    fetchDailyDrug();
  }, []);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    if (isCorrect) {
      // setTimeout(() => setShowModal(true), 2000);
      // window.removeEventListener('keyup', handleKeyup);
      console.log('you guessed it!');
    }
    if (turn > 5) {
      // setTimeout(() => setShowModal(true), 2000);
      // window.removeEventListener('keyup', handleKeyup);
      console.log('you suck...LOSER!');
    }

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup, isCorrect, turn]);

  console.log(
    `turn: ${turn}, currentGuess: ${currentGuess}, guesses: ${guesses}, usedKeys: ${usedKeys}, isCorrect: ${isCorrect}`
  );

  console.log('solution:', solution);

  if (!solution) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Stack spacing={2}>
        {Array.from({ length: numRows }, (_, index) => (
          <DrugdleRow
            key={index}
            numCols={14}
            existingGuess={guesses[index]}
            guessInProgress={index === turn ? currentGuess : ''}
          />
        ))}
      </Stack>
      <Keypad usedKeys={usedKeys} />
    </div>
  );
};

export default Drugdle;
