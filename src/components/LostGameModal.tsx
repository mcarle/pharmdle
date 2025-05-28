import { Button } from '@mui/material';
import React from 'react';

const LostGameModal = ({
  solution,
  onClose,
  open,
}: {
  solution: string;
  onClose: () => void;
  open: boolean;
}) => {
  return (
    <div className="modal" hidden={!open}>
      <div className="modal-content">
        <h2>Game Over</h2>
        <p>
          Ope, you lost. I'm sure you'll do better tomorrow...you definitely
          can't do any worse.
        </p>
        <p>The correct answer was: {solution.replaceAll('*', '')}</p>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
export default LostGameModal;
