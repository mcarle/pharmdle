import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Guess } from '../hooks/usePharmdle';
import { generateShareText } from '../utils/shareResults';

const LostGameModal = ({
  solution,
  onClose,
  open,
  hintsUsed,
  guesses,
}: {
  solution: string;
  onClose: () => void;
  open: boolean;
  hintsUsed: number;
  guesses: Guess[];
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = generateShareText(guesses, hintsUsed, false);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal" hidden={!open}>
      <div className="modal-content">
        <h2>Game Over</h2>
        <p>
          Ope, you lost. I'm sure you'll do better tomorrow...you definitely
          can't do any worse.
        </p>
        <p>
          The correct answer was: <strong>{solution.replaceAll('*', '')}</strong>
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
        <p>
          Hints used: {hintsUsed}
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
export default LostGameModal;
