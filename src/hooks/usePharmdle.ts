import { useEffect, useState } from 'react';

export const letters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

export type Letter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

export type Color = 'green' | 'yellow' | 'grey';

export interface Guess {
  word: string;
  formatted: GuessKey[];
}

export interface GuessKey {
  key: Letter;
  color: Color;
}

export interface KeyColorMap {
  a?: Color;
  b?: Color;
  c?: Color;
  d?: Color;
  e?: Color;
  f?: Color;
  g?: Color;
  h?: Color;
  i?: Color;
  j?: Color;
  k?: Color;
  l?: Color;
  m?: Color;
  n?: Color;
  o?: Color;
  p?: Color;
  q?: Color;
  r?: Color;
  s?: Color;
  t?: Color;
  u?: Color;
  v?: Color;
  w?: Color;
  x?: Color;
  y?: Color;
  z?: Color;
}

const usePharmdle = (numTurns: number) => {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedKeys, setUsedKeys] = useState<KeyColorMap>({});
  const [solution, setSolution] = useState<string>('');

  // format a guess into an array of letter objects
  // e.g. [{key: 'a', color: 'yellow'}]
  const formatGuess = (guess: string): Guess => {
    let solutionArray: string[] = solution.split('');
    let formattedGuess: Guess = {
      // initialize letters with grey color
      formatted: currentGuess.split('').map((l) => {
        return { key: l as Letter, color: 'grey' };
      }),
      word: guess,
    };

    // find any green letters
    formattedGuess.formatted.forEach((keyColorMap, indx) => {
      if (solution[indx] === keyColorMap.key) {
        formattedGuess.formatted[indx].color = 'green';
        // erase letter so it's not matched again
        solutionArray[indx] = '';
      }
    });

    // find any yellow letters
    formattedGuess.formatted.forEach((keyColorMap, indx) => {
      // skip any keys we've already marked green.
      if (
        solutionArray.includes(keyColorMap.key) &&
        keyColorMap.color !== 'green'
      ) {
        formattedGuess.formatted[indx].color = 'yellow';
        solutionArray[solutionArray.indexOf(keyColorMap.key)] = '';
      }
    });

    return formattedGuess;
  };

  // add a new guess to the guesses state
  // update the isCorrect state if the guess is correct
  // add one to the turn state
  const addNewGuess = (formattedGuess: Guess) => {
    console.log(`adding new guess: ${formattedGuess.word}`);
    if (currentGuess === solution) {
      setIsCorrect(true);
    }

    setGuesses((prevGuesses) => {
      const newGuesses = prevGuesses.concat(formattedGuess);
      return newGuesses;
    });

    setUsedKeys((prevUsedKeys: KeyColorMap) => {
      formattedGuess.formatted.forEach((guessKeyColor) => {
        const currentColor = prevUsedKeys[guessKeyColor.key];

        if (guessKeyColor.color === 'green') {
          prevUsedKeys[guessKeyColor.key] = 'green';
          return;
        }
        if (guessKeyColor.color === 'yellow' && currentColor !== 'green') {
          prevUsedKeys[guessKeyColor.key] = 'yellow';
          return;
        }
      });

      return prevUsedKeys;
    });

    setCurrentGuess('');
  };

  const currentTurn = () => {
    return guesses.length;
  };

  // handle keyup event & track current guess
  // if user presses enter, add the new guess
  const handleKeyup = ({ key }: { key: string }) => {
    console.log(`key pressed: ${key}`);
    if (key === 'Enter') {
      // only add guess if turn is less than 5
      if (currentTurn() > numTurns) {
        console.log('you used all your guesses!');
        return;
      }
      // do not allow duplicate words
      if (guesses.some((g) => g.word === currentGuess)) {
        console.log('you already tried that word.');
        return;
      }
      if (currentGuess.length !== solution.length) {
        console.log(`word must be ${solution.length} chars.`);
        return;
      }
      const formatted = formatGuess(currentGuess);
      addNewGuess(formatted);
    }
    if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Za-z\*]$/.test(key)) {
      if (currentGuess.length < solution.length) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
      }
    }
  };

  return {
    currentGuess,
    guesses,
    isCorrect,
    usedKeys,
    handleKeyup,
    solution,
    setSolution,
  };
};

export default usePharmdle;
