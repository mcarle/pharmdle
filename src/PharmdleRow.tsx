import { Paper, Stack, TextField } from '@mui/material';
import React from 'react';
import { Guess } from './hooks/usePharmdle';

export interface PharmdleRowProps {
  numCols: number;
  existingGuess?: Guess;
  guessInProgress?: string;
}

const Row = ({ numCols, existingGuess, guessInProgress }: PharmdleRowProps) => {
  if (existingGuess) {
    return (
      <div className="row past">
        {existingGuess.map((l, i) => (
          <div key={i} className={l.color}>
            {l.key}
          </div>
        ))}
      </div>
    );
  }

  if (guessInProgress) {
    let letters = guessInProgress.split('');

    return (
      <div className="row current">
        {letters.map((letter, i) => (
          <div key={i} className="filled">
            {letter}
          </div>
        ))}
        {[...Array(numCols - letters.length)].map((_, i) => (
          <div key={i}></div>
        ))}
      </div>
    );
  }

  return (
    <div className="row">
      {Array.from({ length: numCols }, (_, index) => (
        <div></div>
      ))}
    </div>
  );
};

export default Row;
