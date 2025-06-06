import { Button } from '@mui/material';
import React from 'react';

const WonGameModal = ({
  solution,
  onClose,
  open,
  numGuesses,
}: {
  solution: string;
  onClose: () => void;
  open: boolean;
  numGuesses: number;
}) => {
  return (
    <div className="modal" hidden={!open}>
      <div className="modal-content">
        <h2>You win!</h2>
        <p>
          You guessed the correct answer of {solution.replaceAll('*', '')} in{' '}
          {numGuesses} {numGuesses === 1 ? 'try' : 'tries'}!
        </p>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
export default WonGameModal;
