import React, { useState } from 'react';
import { GuessKey, KeyColorMap, Letter, letters } from './hooks/usePharmdle';

interface KeypadProps {
  usedKeys: KeyColorMap;
}

export default function Keypad({ usedKeys }: KeypadProps) {
  return (
    <div className="keypad">
      {letters.map((l) => {
        const color = usedKeys[l as Letter];
        return (
          <div key={l} className={color}>
            {l}
          </div>
        );
      })}
    </div>
  );
}
