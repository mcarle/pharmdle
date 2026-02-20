import React from 'react';
import { KeyColorMap, Letter } from './hooks/usePharmdle';

interface KeypadProps {
  usedKeys: KeyColorMap;
  onKeyClick: (key: string) => void;
}

const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '*', 'Backspace'],
];

export default function Keypad({ usedKeys, onKeyClick }: KeypadProps) {
  return (
    <div className="keypad">
      {rows.map((row, i) => (
        <div key={i} className="keypad-row">
          {row.map((key) => {
            const color = usedKeys[key as Letter] || '';
            const isWide = key === 'Enter' || key === 'Backspace';
            const label = key === 'Backspace' ? 'Del' : key;
            return (
              <div
                key={key}
                className={`keypad-key ${color} ${isWide ? 'wide' : ''}`}
                onClick={() => onKeyClick(key)}
              >
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
