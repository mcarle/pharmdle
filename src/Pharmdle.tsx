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
    turn,
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

  // const modalStyle = {
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: 'translate(-50%, -50%)',
  //   width: 400,
  //   bgcolor: 'background.paper',
  //   border: '2px solid #000',
  //   boxShadow: 24,
  //   p: 4,
  // };

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
            guessInProgress={index === turn ? currentGuess : ''}
          />
        ))}
      </Stack>
      <Keypad usedKeys={usedKeys} />
      <LostGameModal
        open={shouldShowLostGameModal() && !modalCleared}
        solution={solution}
        onClose={() => setModalCleared(true)}
      />
      {/* <Button onClick={() => setShowModal(true)}>Open modal</Button>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal> */}
    </div>
  );
};

export default Pharmdle;
