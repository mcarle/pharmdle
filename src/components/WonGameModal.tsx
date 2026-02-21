import { Button } from '@mui/material';
import React from 'react';

const WonGameModal = ({
  solution,
  onClose,
  open,
  numGuesses,
  hintsUsed,
}: {
  solution: string;
  onClose: () => void;
  open: boolean;
  numGuesses: number;
  hintsUsed: number;
}) => {
  return (
    <div className="modal" hidden={!open}>
      <div className="modal-content">
        <h2>You win!</h2>
        <p>
          You guessed the correct answer of {solution.replaceAll('*', '')} in{' '}
          {numGuesses} {numGuesses === 1 ? 'try' : 'tries'}
          {hintsUsed > 0
            ? ` using ${hintsUsed} ${hintsUsed === 1 ? 'hint' : 'hints'}`
            : ' using no hints'}
          !
        </p>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
export default WonGameModal;
