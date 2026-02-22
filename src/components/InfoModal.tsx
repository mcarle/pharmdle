import { Button } from '@mui/material';
import React from 'react';

const InfoModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <div className="modal" hidden={!open}>
      <div className="modal-content info-modal-content">
        <h2>How to Play</h2>

        <div className="info-section">
          <p>
            Pharmdle is a pharmacy-themed word-guessing game. Each day, a new
            pharmaceutical drug name is selected and you have 6 attempts to guess
            it.
          </p>
        </div>

        <div className="info-section">
          <h3>Rules</h3>
          <ol>
            <li>Type a valid drug name using the on-screen or physical keyboard</li>
            <li>Press <strong>Enter</strong> to submit your guess</li>
            <li>After each guess, tiles flip to reveal colour-coded feedback</li>
            <li>Use the feedback to narrow down the answer</li>
            <li>The drug name may be shorter than 14 characters — empty tiles past the answer will turn green</li>
          </ol>
        </div>

        <div className="info-section">
          <h3>Colour Guide</h3>
          <div className="color-legend">
            <div className="color-legend-row">
              <span className="color-example green">A</span>
              <span>Correct letter in the correct position</span>
            </div>
            <div className="color-legend-row">
              <span className="color-example yellow">A</span>
              <span>Correct letter in the wrong position</span>
            </div>
            <div className="color-legend-row">
              <span className="color-example grey">A</span>
              <span>Letter is not in the word</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Hints</h3>
          <p>
            Tap the <strong>Hints</strong> button to open the hints drawer. You
            can progressively reveal clues about the drug, such as its route,
            dosage form, and pharmacological class. The number of hints you use
            is tracked and shown at the end of the game.
          </p>
        </div>

        <div className="info-section">
          <h3>About</h3>
          <p>
            Drug data sourced from the{' '}
            <a
              href="https://open.fda.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              FDA openFDA database
            </a>
            . A new puzzle is available every day at midnight CT.
          </p>
        </div>

        <div className="info-modal-buttons">
          <Button
            variant="outlined"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfmctEN7bDDdJC95Wxrr_T_usrRplLmCvl7WgmnfEs63QvA_Q/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            Submit Feedback
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
