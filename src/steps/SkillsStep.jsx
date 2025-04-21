// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import StepWrapper from '../components/StepWrapper';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';

export function SkillsStep({ formData = {}, onChange }) {
  const {
    culture = '',
    career  = '',
    skills  = {},    // { skillKey: allocatedValue, ... }
  } = formData;

  // Look up which skills to show
  const cultureDef = cultures[culture] || {};
  const careerDef  = careers[career]   || {};

  const cultureStandard = cultureDef.standardSkills    || [];
  const cultureProfessional = cultureDef.professionalSkills || [];
  const combatStyles = cultureDef.combatStyles            || [];

  const careerStandard = careerDef.standardSkills    || [];
  const careerProfessional = careerDef.professionalSkills || [];

  // Compute each skill’s base % from attributes
  const attrs = formData; // attributes live in formData (STR, DEX, etc)
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0,10);
    for (let i = 1; i < parts.length; i+=2) {
      const op = parts[i],
            token = parts[i+1],
            v = /^\d+$/.test(token)
              ? parseInt(token,10)
              : parseInt(attrs[token]||0,10);
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Precompute base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ key, name, base }) => {
    baseStandard[key] = computeBase(base) + (name === 'Customs'||name === 'Native Tongue' ? 40 : 0);
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ key, base }) => {
    baseProfessional[key] = computeBase(base);
  });
  const baseCombat = {};
  combatStyles.forEach(style => {
    baseCombat[style] = (attrs.STR||0) + (attrs.DEX||0);
  });

  // Local selections (so we can step through phases, if you need multiple)
  const [phase, setPhase] = useState(1);

  // Allocations in local state mirror formData.skills or initialize to {}
  const [cultStdAlloc,    setCultStdAlloc]    = useState(skills.cultStdAlloc    || {});
  const [cultProfAlloc,   setCultProfAlloc]   = useState(skills.cultProfAlloc   || {});
  const [cultCombatAlloc, setCultCombatAlloc] = useState(skills.cultCombatAlloc || {});
  const [careerStdAlloc,  setCareerStdAlloc]  = useState(skills.careerStdAlloc  || {});
  const [careerProfAlloc, setCareerProfAlloc] = useState(skills.careerProfAlloc || {});
  
  // When phase is done, merge everything into formData.skills
  useEffect(() => {
    if (phase > 1) {
      onChange('skills', {
        cultStdAlloc, cultProfAlloc, cultCombatAlloc,
        careerStdAlloc, careerProfAlloc
      });
    }
  }, [phase]);

  // Simple helper to clamp a skill add-on between 0 and 100
  const clamp = v => Math.max(0, Math.min(100, v));

  return (
    <StepWrapper title="Skills">
      {phase === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Cultural Skills</h3>
          {/* Standard */}
          <h4 className="font-medium">Standard Skills</h4>
          {cultureStandard.map(key => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-32">{skillsData.standard.find(s=>s.key===key)?.name}</span>
              <input
                type="number"
                className="form-control w-20"
                min={0}
                max={100}
                value={cultStdAlloc[key]||0}
                onChange={e => {
                  const v = clamp(+e.target.value);
                  setCultStdAlloc(prev => ({ ...prev, [key]: v }));
                }}
              />
              <span>
                Base: {baseStandard[key]||0}% → { (baseStandard[key]||0) + (cultStdAlloc[key]||0) }%
              </span>
            </div>
          ))}

          {/* Professional */}
          <h4 className="font-medium">Professional Skills</h4>
          {cultureProfessional.map(key => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-32">{skillsData.professional.find(s=>s.key===key)?.name}</span>
              <input
                type="number"
                className="form-control w-20"
                min={0}
                max={100}
                value={cultProfAlloc[key]||0}
                onChange={e => {
                  const v = clamp(+e.target.value);
                  setCultProfAlloc(prev => ({ ...prev, [key]: v }));
                }}
              />
              <span>
                Base: {baseProfessional[key]||0}% → { (baseProfessional[key]||0) + (cultProfAlloc[key]||0) }%
              </span>
            </div>
          ))}

          {/* Combat Styles */}
          {combatStyles.length > 0 && (
            <>
              <h4 className="font-medium">Combat Styles</h4>
              {combatStyles.map(style => (
                <div key={style} className="flex items-center space-x-2">
                  <span className="w-32">{style}</span>
                  <input
                    type="number"
                    className="form-control w-20"
                    min={0}
                    max={100}
                    value={cultCombatAlloc[style]||0}
                    onChange={e => {
                      const v = clamp(+e.target.value);
                      setCultCombatAlloc({ [style]: v });
                    }}
                  />
                  <span>
                    Base: {baseCombat[style]||0}% → { (baseCombat[style]||0) + (cultCombatAlloc[style]||0) }%
                  </span>
                </div>
              ))}
            </>
          )}

          <div className="mt-4">
            <button
              onClick={() => setPhase(2)}
              className="btn btn-primary"
            >
              Next: Career Skills
            </button>
          </div>
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Career Skills</h3>
          {/* Similar pattern for careerStandard & careerProfessional */}
          {careerStandard.map(key => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-32">{skillsData.standard.find(s=>s.key===key)?.name}</span>
              <input
                type="number"
                className="form-control w-20"
                min={0}
                max={100}
                value={careerStdAlloc[key]||0}
                onChange={e => {
                  const v = clamp(+e.target.value);
                  setCareerStdAlloc(prev => ({ ...prev, [key]: v }));
                }}
              />
              <span>
                Base: {baseStandard[key]||0}% → { (baseStandard[key]||0) + (careerStdAlloc[key]||0) }%
              </span>
            </div>
          ))}

          <h4 className="font-medium">Professional Skills</h4>
          {careerProfessional.map(key => (
            <div key={key} className="flex items-center space-x-2">
              <span className="w-32">{skillsData.professional.find(s=>s.key===key)?.name}</span>
              <input
                type="number"
                className="form-control w-20"
                min={0}
                max={100}
                value={careerProfAlloc[key]||0}
                onChange={e => {
                  const v = clamp(+e.target.value);
                  setCareerProfAlloc(prev => ({ ...prev, [key]: v }));
                }}
              />
              <span>
                Base: {baseProfessional[key]||0}% → { (baseProfessional[key]||0) + (careerProfAlloc[key]||0) }%
              </span>
            </div>
          ))}

          <div className="mt-4 flex space-x-2">
            <button onClick={() => setPhase(1)} className="btn btn-secondary">
              Back
            </button>
            <button onClick={() => setPhase(3)} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      )}
    </StepWrapper>
  );
}
