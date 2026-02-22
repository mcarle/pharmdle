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
  key: Letter | '';
  color: Color | '';
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

export interface InitialGameState {
  guesses: Guess[];
  isCorrect: boolean;
  usedKeys: KeyColorMap;
}

const usePharmdle = (numTurns: number, validDrugs: Set<string>, initialState?: InitialGameState) => {
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>(initialState?.guesses ?? []);
  const [isCorrect, setIsCorrect] = useState(initialState?.isCorrect ?? false);
  const [usedKeys, setUsedKeys] = useState<KeyColorMap>(initialState?.usedKeys ?? {});
  const [solution, setSolution] = useState<string>('');
  const [message, setMessage] = useState<string>('');

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

    // pad to 14 columns: positions beyond the solution are green (correctly blank)
    for (let i = guess.length; i < 14; i++) {
      formattedGuess.formatted.push({
        key: '',
        color: i >= solution.length ? 'green' : '',
      });
    }

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
        if (!guessKeyColor.key) return; // skip blank padding cells
        const key = guessKeyColor.key as Letter;
        const currentColor = prevUsedKeys[key];

        if (guessKeyColor.color === 'green') {
          prevUsedKeys[key] = 'green';
          return;
        }
        if (guessKeyColor.color === 'yellow' && currentColor !== 'green') {
          prevUsedKeys[key] = 'yellow';
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
    if (isCorrect || currentTurn() >= numTurns) {
      return;
    }

    if (key === 'Enter') {
      if (currentTurn() > numTurns) {
        return;
      }
      if (currentGuess.length === 0) {
        return;
      }
      if (guesses.some((g) => g.word === currentGuess)) {
        setMessage('Already tried that word');
        setTimeout(() => setMessage(''), 2000);
        return;
      }
      if (!validDrugs.has(currentGuess)) {
        setMessage('Not a valid drug');
        setTimeout(() => setMessage(''), 2000);
        return;
      }
      const formatted = formatGuess(currentGuess);
      addNewGuess(formatted);
    }
    if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < 14) {
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
    message,
  };
};

export default usePharmdle;
