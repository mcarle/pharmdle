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
          You guessed the correct answer of{' '}
          <strong>{solution.replaceAll('*', '')}</strong> in{' '}
          {numGuesses} {numGuesses === 1 ? 'try' : 'tries'}
          {hintsUsed > 0
            ? ` using ${hintsUsed} ${hintsUsed === 1 ? 'hint' : 'hints'}`
            : ' using no hints'}
          !
        </p>
        <p>
          <a
            href={`https://www.drugs.com/search.php?searchterm=${encodeURIComponent(solution)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about {solution} on Drugs.com
          </a>
        </p>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
export default WonGameModal;
