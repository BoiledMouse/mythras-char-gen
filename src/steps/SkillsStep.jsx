// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const {
    culture: cultKey = '',
    career: careerKey = '',
    age = 0
  } = character;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 0) Attributes map (ensure we pick up either upper- or lower-case)
  const attrs = {
    STR: Number(character.STR ?? character.str ?? 0),
    DEX: Number(character.DEX ?? character.dex ?? 0),
    CON: Number(character.CON ?? character.con ?? 0),
    SIZ: Number(character.SIZ ?? character.siz ?? 0),
    INT: Number(character.INT ?? character.int ?? 0),
    POW: Number(character.POW ?? character.pow ?? 0),
    CHA: Number(character.CHA ?? character.cha ?? 0),
  };

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: bonusPool, maxInc } = ageBuckets.find(b => age <= b.max);

  const CULTURAL_POOL = 100;
  const CAREER_POOL  = 100;

  // 2) Compute base skill from formula string
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    const getVal = tok =>
      /^\d+$/.test(tok) ? Number(tok) : Number(attrs[tok] ?? 0);

    let v = getVal(parts[0]);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i],
            tok = parts[i + 1],
            x   = getVal(tok);
      v = op === 'x' ? v * x : v + x;
    }
    return v;
  };

  // 3) Build base lookup tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (["Customs","Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Skills available from culture & career
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills  || [];
  const combatStyles = cultureDef.combatStyles  || [];

  // 5) Step & pools
  const [step,      setStep     ] = useState(1);
  const [cultLeft,  setCultLeft ] = useState(CULTURAL_POOL);
  const [careLeft,  setCareLeft ] = useState(CAREER_POOL);
  const [bonusLeft, setBonusLeft] = useState(bonusPool);

  const [cultStdAlloc,  setCultStdAlloc ]  = useState({});
  const [cultProfAlloc, setCultProfAlloc] = useState({});
  const [combatAlloc,   setCombatAlloc  ] = useState({});
  const [carStdAlloc,   setCarStdAlloc  ] = useState({});
  const [carProfAlloc,  setCarProfAlloc ] = useState({});
  const [bonusAlloc,    setBonusAlloc   ] = useState({});

  // slider change handler
  const handleAlloc = (setter, allocObj, poolLeft, setPoolLeft, key) => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v > 0 && v < 5) v = 0;                     // snap small values to zero
    v = Math.min(maxInc, Math.max(0, v));          // clamp
    const prev = allocObj[key] || 0,
          delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  // 6) Persist final when done
  useEffect(() => {
    if (step === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      // cultural
      cultStd.forEach(s => final[s] += cultStdAlloc[s] || 0);
      cultProf.forEach(s=> final[s] += cultProfAlloc[s]||0);
      Object.entries(combatAlloc).forEach(([s,v])=> final[s]+=v);
      // career
      carStd.forEach(s=> final[s] += carStdAlloc[s]||0);
      carProf.forEach(s=> final[s] += carProfAlloc[s]||0);
      // bonus
      Object.entries(bonusAlloc).forEach(([s,v])=> final[s]+=v);
      updateCharacter({ skills: final });
    }
  }, [step]);

  return (
    <StepWrapper title="Skills Allocation">
      {/* —— NEW: show Age / Culture / Career —— */}
      <p>
        Age: <strong>{age}</strong> &nbsp;|&nbsp;
        Culture: <strong>{cultKey || '—'}</strong> &nbsp;|&nbsp;
        Career: <strong>{careerDef.name || careerKey || '—'}</strong>
      </p>
      <p>
        Pools ⇒ Cultural: <strong>{CULTURAL_POOL}</strong>,
        Career: <strong>{CAREER_POOL}</strong>,
        Bonus: <strong>{bonusPool}</strong>,
        Max/skill: +<strong>{maxInc}</strong>
      </p>

      {step === 1 && (
        <>
          <h3>Step 1: Cultural Skills ({cultLeft} pts left)</h3>
          {/* Standard */}
          <h4>Standard</h4>
          {cultStd.map(skill => {
            const base  = baseStandard[skill] || 0;
            const extra = cultStdAlloc[skill] || 0;
            return (
              <div key={skill} className="flex items-center space-x-4 my-2">
                <div className="flex-1">
                  <label>{skill} (base {base}%)</label>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCultStdAlloc, cultStdAlloc,
                      cultLeft, setCultLeft, skill
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}
          {/* Professional */}
          <h4>Professional (pick up to {cultProf.length})</h4>
          {cultProf.map(skill => {
            const base      = baseProfessional[skill] || 0;
            const isChecked = skill in cultProfAlloc;
            return (
              <div key={skill} className="my-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                        setCultProfAlloc({ ...cultProfAlloc, [skill]: 0 });
                      } else {
                        const { [skill]:_, ...rest } = cultProfAlloc;
                        setCultProfAlloc(rest);
                      }
                    }}
                  />
                  <span className="ml-2">{skill} (base {base}%)</span>
                </label>
                {isChecked && (
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={cultProfAlloc[skill]}
                    onChange={handleAlloc(
                      setCultProfAlloc, cultProfAlloc,
                      cultLeft, setCultLeft, skill
                    )}
                    className="w-full mt-1"
                  />
                )}
              </div>
            );
          })}
          {/* Combat */}
          <h4>Combat Styles (choose one)</h4>
          {combatStyles.map(skill => {
            const base    = baseProfessional[skill] || 0;
            const selected= combatAlloc[skill] || 0;
            return (
              <div key={skill} className="my-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio" name="combatStyle"
                    checked={!!selected}
                    onChange={() => setCombatAlloc({ [skill]: 0 })}
                  />
                  <span className="ml-2">{skill} (base {base}%)</span>
                </label>
                {selected !== undefined && (
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={selected}
                    onChange={handleAlloc(
                      setCombatAlloc, combatAlloc,
                      cultLeft, setCultLeft, skill
                    )}
                    className="w-full mt-1"
                  />
                )}
              </div>
            );
          })}
          <button
            onClick={() => setStep(2)}
            className="btn btn-primary mt-4"
            disabled={cultLeft !== 0}
          >
            Next: Career
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Step 2: Career Skills ({careLeft} pts left)</h3>
          {/* Standard */}
          <h4>Standard</h4>
          {carStd.map(skill => {
            const base  = baseStandard[skill] || 0;
            const extra = carStdAlloc[skill] || 0;
            return (
              <div key={skill} className="flex items-center space-x-4 my-2">
                <div className="flex-1">
                  <label>{skill} (base {base}%)</label>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCarStdAlloc, carStdAlloc,
                      careLeft, setCareLeft, skill
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}
          {/* Professional */}
          <h4>Professional (pick up to {carProf.length})</h4>
          {carProf.map(skill => {
            const base      = baseProfessional[skill] || 0;
            const isChecked = skill in carProfAlloc;
            return (
              <div key={skill} className="my-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                        setCarProfAlloc({ ...carProfAlloc, [skill]: 0 });
                      } else {
                        const { [skill]:_, ...rest } = carProfAlloc;
                        setCarProfAlloc(rest);
                      }
                    }}
                  />
                  <span className="ml-2">{skill} (base {base}%)</span>
                </label>
                {isChecked && (
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={carProfAlloc[skill]}
                    onChange={handleAlloc(
                      setCarProfAlloc, carProfAlloc,
                      careLeft, setCareLeft, skill
                    )}
                    className="w-full mt-1"
                  />
                )}
              </div>
            );
          })}
          <button
            onClick={() => setStep(3)}
            className="btn btn-primary mt-4"
            disabled={careLeft !== 0}
          >
            Next: Bonus
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Step 3: Bonus / Hobby Skills ({bonusLeft} pts left)</h3>
          {[
            ...cultStd, ...cultProf,
            ...carStd,  ...carProf,
            ...combatStyles,
          ]
            .filter((s,i,a) => s && a.indexOf(s) === i)
            .map(skill => {
              const base  = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
              const extra = bonusAlloc[skill] || 0;
              return (
                <div key={skill} className="flex items-center space-x-4 my-2">
                  <div className="flex-1">
                    <label>{skill} (base {base}%)</label>
                    <input
                      type="range"
                      min={0} max={maxInc} step={1}
                      value={extra}
                      onChange={handleAlloc(
                        setBonusAlloc, bonusAlloc,
                        bonusLeft, setBonusLeft, skill
                      )}
                      className="w-full"
                    />
                  </div>
                  <div className="w-12 text-right">+{extra}%</div>
                </div>
              );
            })}
          <button
            onClick={() => setStep(4)}
            className="btn btn-primary mt-4"
            disabled={bonusLeft !== 0}
          >
            Finish Skills
          </button>
        </>
      )}
    </StepWrapper>
  );
}
