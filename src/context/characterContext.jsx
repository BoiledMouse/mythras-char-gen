// src/context/characterContext.js

import React, { createContext, useContext, useState } from 'react';

const CharacterContext = createContext();

export function CharacterProvider({ children }) {
  const [character, setCharacter] = useState({
    // Concept step
    name: '',
    playerName: '',
    gender: '',
    age: '',
    culture: '',
    career: '',
    socialClass: '',
    startingMoney: 0,

    // Attributes (you may already be initializing these elsewhere)
    STR: 0,
    CON: 0,
    DEX: 0,
    INT: 0,
    POW: 0,
    CHA: 0,

    // Skills (filled in later steps)
    skills: {},

    // …any other fields your app uses (equipment, magic, etc.)…
  });

  function updateCharacter(patch) {
    setCharacter(current => ({
      ...current,
      ...patch
    }));
  }

  return (
    <CharacterContext.Provider value={{ character, updateCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return ctx;
}
