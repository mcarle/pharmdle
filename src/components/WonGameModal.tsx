import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Guess } from '../hooks/usePharmdle';
import { generateShareText } from '../utils/shareResults';

const WonGameModal = ({
  solution,
  onClose,
  open,
  numGuesses,
  hintsUsed,
  guesses,
}: {
  solution: string;
  onClose: () => void;
  open: boolean;
  numGuesses: number;
  hintsUsed: number;
  guesses: Guess[];
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = generateShareText(guesses, hintsUsed, true);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
        <div className="modal-buttons">
          <Button variant="outlined" onClick={handleShare}>
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
export default WonGameModal;
