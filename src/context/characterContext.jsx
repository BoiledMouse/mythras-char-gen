// src/context/characterContext.jsx
import create from 'zustand';

export const useCharacter = create(set => ({
  character: {
    // Concept
    name: '', player: '', culture: '', career: '',
    // Attributes
    STR: 0, CON: 0, DEX: 0, POW: 0, CHA: 0, INT: 0, SIZ: 0,
    // Skills
    cultAlloc: {}, careerAlloc: {}, bonusAlloc: {}, profSkills: [],
    maxCulturalPoints: 100,
    maxCareerPoints: 100,
    maxBonusPoints: 150,
    // Equipment
    equipment: [],
    // Magic
    magicAbilities: [], maxMagicPoints: 0,
    // Cult
    cultMemberships: [],
  },
  updateCharacter: updates => set(state => ({
    character: { ...state.character, ...updates }
  }))
}));
