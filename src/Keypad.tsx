import React, { useEffect, useState } from 'react';
import { GuessKey, KeyColorMap } from './hooks/useDrugdle';

interface KeypadProps {
  usedKeys: KeyColorMap;
}

export default function Keypad({ usedKeys }: KeypadProps) {
  const [letters, setLetters] = useState<GuessKey[]>([
    { key: 'q', color: 'grey' },
    { key: 'w', color: 'grey' },
    { key: 'e', color: 'grey' },
    { key: 'r', color: 'grey' },
    { key: 't', color: 'grey' },
    { key: 'y', color: 'grey' },
    { key: 'u', color: 'grey' },
    { key: 'i', color: 'grey' },
    { key: 'o', color: 'grey' },
    { key: 'p', color: 'grey' },
    { key: 'a', color: 'grey' },
    { key: 's', color: 'grey' },
    { key: 'd', color: 'grey' },
    { key: 'f', color: 'grey' },
    { key: 'g', color: 'grey' },
    { key: 'h', color: 'grey' },
    { key: 'j', color: 'grey' },
    { key: 'k', color: 'grey' },
    { key: 'l', color: 'grey' },
    { key: 'z', color: 'grey' },
    { key: 'x', color: 'grey' },
    { key: 'c', color: 'grey' },
    { key: 'v', color: 'grey' },
    { key: 'b', color: 'grey' },
    { key: 'n', color: 'grey' },
    { key: 'm', color: 'grey' },
  ]);

  return (
    <div className="keypad">
      {letters &&
        letters.map((l) => {
          const color = usedKeys[l.key];
          return (
            <div key={l.key} className={color}>
              {l.key}
            </div>
          );
        })}
    </div>
  );
}
