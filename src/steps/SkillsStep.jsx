// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import StepWrapper from '../components/StepWrapper';
import cultures   from '../data/cultures.json';
import careers    from '../data/careers.json';
import skillsData from '../data/skills.json';

export function SkillsStep({ formData = {}, onChange }) {
  const { culture = '', career = '', skills = {} } = formData;

  const cultureDef = cultures[culture] || {};
  const careerDef  = careers[career]   || {};

  const cultureStandard    = cultureDef.standardSkills    || [];
  const cultureProfessional= cultureDef.professionalSkills|| [];
  const combatStyles       = cultureDef.combatStyles      || [];

  const careerStandard     = careerDef.standardSkills     || [];
  const careerProfessional = careerDef.professionalSkills || [];

  // compute base values
  const attrs = formData;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], token = parts[i+1];
      const v = /^\d+$/.test(token)
        ? parseInt(token,10)
        : parseInt(attrs[token] || 0,10);
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  const baseStandard = {};
  skillsData.standard.forEach(({ key, name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[key] = b;
  });

  const baseProfessional = {};
  skillsData.professional.forEach(({ key, base }) => {
    baseProfessional[key] = computeBase(base);
  });

  const baseCombat = {};
  combatStyles.forEach(style => {
    baseCombat[style] = (attrs.STR||0) + (attrs.DEX||0);
  });

  // local allocations mirror formData.skills
  const [cultStdAlloc, setCultStdAlloc]       = useState(skills.cultStdAlloc       || {});
  const [cultProfAlloc,setCultProfAlloc]      = useState(skills.cultProfAlloc      || {});
  const [cultCombatAlloc, setCultCombatAlloc] = useState(skills.cultCombatAlloc   || {});
  const [careerStdAlloc,setCareerStdAlloc]    = useState(skills.careerStdAlloc    || {});
  const [careerProfAlloc,setCareerProfAlloc]  = useState(skills.careerProfAlloc   || {});

  // when allocations change, push back to formData
  useEffect(() => {
    onChange('skills', {
      cultStdAlloc,
      cultProfAlloc,
      cultCombatAlloc,
      careerStdAlloc,
      careerProfAlloc
    });
  }, [cultStdAlloc, cultProfAlloc, cultCombatAlloc, careerStdAlloc, careerProfAlloc]);

  // clamp helper: 0–15, but anything non‑zero must be at least 5
  const adjust = v => {
    v = Math.max(0, Math.min(15, v));
    if (v > 0 && v < 5) v = 5;
    return v;
  };

  return (
    <StepWrapper title="Skills">
      {/* Cultural Standard */}
      <h3 className="font-semibold">Cultural: Standard Skills</h3>
      {cultureStandard.map(key => {
        const def = skillsData.standard.find(s => s.key === key);
        const base = baseStandard[key] || 0;
        const alloc = cultStdAlloc[key] || 0;
        return (
          <label key={key} className="block mb-4">
            <div className="flex justify-between mb-1">
              <span>{def?.name}</span>
              <span>Base {base}% → {base + alloc}%</span>
            </div>
            <input
              type="number"
              className="form-control"
              min={0}
              max={15}
              value={alloc}
              onChange={e => {
                const v = adjust(+e.target.value);
                setCultStdAlloc(prev => ({ ...prev, [key]: v }));
              }}
            />
          </label>
        );
      })}

      {/* Cultural Professional */}
      <h3 className="font-semibold mt-8">Cultural: Professional Skills</h3>
      {cultureProfessional.map(key => {
        const def = skillsData.professional.find(s => s.key === key);
        const base = baseProfessional[key] || 0;
        const alloc = cultProfAlloc[key] || 0;
        return (
          <label key={key} className="block mb-4">
            <div className="flex justify-between mb-1">
              <span>{def?.name}</span>
              <span>Base {base}% → {base + alloc}%</span>
            </div>
            <input
              type="number"
              className="form-control"
              min={0}
              max={15}
              value={alloc}
              onChange={e => {
                const v = adjust(+e.target.value);
                setCultProfAlloc(prev => ({ ...prev, [key]: v }));
              }}
            />
          </label>
        );
      })}

      {/* Combat Styles */}
      {combatStyles.length > 0 && <>
        <h3 className="font-semibold mt-8">Cultural: Combat Styles</h3>
        {combatStyles.map(style => {
          const base = baseCombat[style] || 0;
          const alloc = cultCombatAlloc[style] || 0;
          return (
            <label key={style} className="block mb-4">
              <div className="flex justify-between mb-1">
                <span>{style}</span>
                <span>Base {base}% → {base + alloc}%</span>
              </div>
              <input
                type="number"
                className="form-control"
                min={0}
                max={15}
                value={alloc}
                onChange={e => {
                  const v = adjust(+e.target.value);
                  setCultCombatAlloc({ [style]: v });
                }}
              />
            </label>
          );
        })}
      </>}

      {/* Career Standard */}
      <h3 className="font-semibold mt-8">Career: Standard Skills</h3>
      {careerStandard.map(key => {
        const def = skillsData.standard.find(s => s.key === key);
        const base = baseStandard[key] || 0;
        const alloc = careerStdAlloc[key] || 0;
        return (
          <label key={key} className="block mb-4">
            <div className="flex justify-between mb-1">
              <span>{def?.name}</span>
              <span>Base {base}% → {base + alloc}%</span>
            </div>
            <input
              type="number"
              className="form-control"
              min={0}
              max={15}
              value={alloc}
              onChange={e => {
                const v = adjust(+e.target.value);
                setCareerStdAlloc(prev => ({ ...prev, [key]: v }));
              }}
            />
          </label>
        );
      })}

      {/* Career Professional */}
      <h3 className="font-semibold mt-8">Career: Professional Skills</h3>
      {careerProfessional.map(key => {
        const def = skillsData.professional.find(s => s.key === key);
        const base = baseProfessional[key] || 0;
        const alloc = careerProfAlloc[key] || 0;
        return (
          <label key={key} className="block mb-4">
            <div className="flex justify-between mb-1">
              <span>{def?.name}</span>
              <span>Base {base}% → {base + alloc}%</span>
            </div>
            <input
              type="number"
              className="form-control"
              min={0}
              max={15}
              value={alloc}
              onChange={e => {
                const v = adjust(+e.target.value);
                setCareerProfAlloc(prev => ({ ...prev, [key]: v }));
              }}
            />
          </label>
        );
      })}

      <button
        onClick={() => onChange('step', 'equipment')}
        className="btn btn-primary mt-6"
      >
        Next: Equipment
      </button>
    </StepWrapper>
  );
}
