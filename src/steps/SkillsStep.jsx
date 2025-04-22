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
    age = 0,
    culture: cultKey,
    career: careerKey,
    STR = 0,
    DEX = 0,
    CON = 0,
    SIZ = 0,
    INT = 0,
    POW = 0,
    CHA = 0,
  } = character;
  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  //── 1) AGE BUCKETS ─────────────────────────────────────────────────────────
  // Cultural & career pools always 100; bonus comes from age.
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: bonusPool = 100, maxInc = 10 } =
    ageBuckets.find(b => age <= b.max) || {};
  const CULTURAL_POOL = 100;
  const CAREER_POOL  = 100;

  //── 2) BASE CALCULATION ────────────────────────────────────────────────────
  const attrs = { STR, DEX, CON, SIZ, INT, POW, CHA };
  function computeBase(expr) {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  }

  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (["Customs", "Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });

  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  //── 3) STEP FLOW STATE ────────────────────────────────────────────────────
  // step 1 = cultural, 2 = career, 3 = bonus, 4 = done/persist
  const [step, setStep] = useState(1);

  // pools left
  const [cultLeft,  setCultLeft]  = useState(CULTURAL_POOL);
  const [carLeft,   setCarLeft]   = useState(CAREER_POOL);
  const [bonusLeft, setBonusLeft] = useState(bonusPool);

  // allocations
  const [cultAlloc,   setCultAlloc]   = useState({});
  const [carStdAlloc, setCarStdAlloc] = useState({});
  const [profSel,     setProfSel]     = useState([]);
  const [profAlloc,   setProfAlloc]   = useState({});
  const [bonusSel,    setBonusSel]    = useState([]);
  const [bonusAlloc,  setBonusAlloc]  = useState({});

  //── 4) SLIDER HANDLER FACTORY ───────────────────────────────────────────────
  const clamp = (v, avail) => {
    v = Math.max(0, Math.min(maxInc, v));
    return v > avail ? avail : v;
  };

  function makeHandler(alloc, setAlloc, left, setLeft) {
    return skill => e => {
      let v = parseInt(e.target.value || 0, 10);
      if (v > 0 && v < 5) v = 0;                // snap 1–4 ⇒ 0
      v = clamp(v, left + (alloc[skill]||0));  // clamp to [0..maxInc], can't overspend
      const delta = v - (alloc[skill]||0);
      if (delta <= left) {
        setAlloc({ ...alloc, [skill]: v });
        setLeft(l => l - delta);
      }
    };
  }

  const handleCult   = makeHandler(cultAlloc,   setCultAlloc,   cultLeft,  setCultLeft);
  const handleCarStd = makeHandler(carStdAlloc, setCarStdAlloc, carLeft,   setCarLeft);
  const handleProf   = makeHandler(profAlloc,   setProfAlloc,   carLeft,   setCarLeft);
  const handleBonus  = makeHandler(bonusAlloc,  setBonusAlloc,  bonusLeft, setBonusLeft);

  //── 5) PROFESSIONAL TOGGLE ─────────────────────────────────────────────────
  function toggleProf(skill) {
    if (profSel.includes(skill)) {
      const used = profAlloc[skill] || 0;
      setProfAlloc(a => { let n = { ...a }; delete n[skill]; return n });
      setCarLeft(l => l + used);
      setProfSel(s => s.filter(x => x !== skill));
    } else {
      setProfSel(s => [...s, skill]);
    }
  }

  //── 6) FINAL PERSIST ───────────────────────────────────────────────────────
  useEffect(() => {
    if (step === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      // culture
      (cultureDef.standardSkills || []).forEach(s => final[s] += cultAlloc[s] || 0);
      (cultureDef.professionalSkills || []).forEach(s => final[s] += cultAlloc[s] || 0);
      // career
      (careerDef.standardSkills || []).forEach(s => final[s] += carStdAlloc[s] || 0);
      profSel.forEach(s => final[s] += profAlloc[s] || 0);
      // bonus
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      updateCharacter({ skills: final });
    }
  }, [step]);

  //── 7) RENDER ──────────────────────────────────────────────────────────────
  return (
    <StepWrapper title="Skills Allocation">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Cultural Pool: <strong>{CULTURAL_POOL}</strong>,&nbsp;
        Career Pool: <strong>{CAREER_POOL}</strong>,&nbsp;
        Bonus Pool: <strong>{bonusPool}</strong>,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {step === 1 && (
        <>
          <h3>Step 1: Cultural Skills ({cultLeft} pts left)</h3>
          {["standardSkills","professionalSkills"].map(type => (
            <div key={type} className="mt-3">
              <h4 className="font-bold">
                {type==="standardSkills" ? "Standard Skills" : "Professional Skills"}
              </h4>
              {(cultureDef[type] || []).map(skill => {
                const base = (type==="standardSkills")
                  ? baseStandard[skill]||0
                  : baseProfessional[skill]||0;
                const alloc = cultAlloc[skill]||0;
                return (
                  <div key={skill} className="flex items-center my-1 space-x-4">
                    <div className="w-40">{skill} (base {base}%)</div>
                    <input
                      type="range"
                      min={0}
                      max={maxInc}
                      step={1}
                      value={alloc}
                      onChange={
                        type==="standardSkills"
                          ? handleCult(skill)
                          : handleCult(skill)
                      }
                      className="flex-1"
                    />
                    <div className="w-12 text-right">+{alloc}%</div>
                  </div>
                );
              })}
            </div>
          ))}
          <button
            className="btn btn-primary mt-4"
            disabled={cultLeft > 0}
            onClick={() => setStep(2)}
          >
            Next: Career Skills
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Step 2: Career Skills ({carLeft} pts left)</h3>

          <div className="mt-3">
            <h4 className="font-bold">Standard Skills</h4>
            {(careerDef.standardSkills || []).map(skill => {
              const base = baseStandard[skill]||0;
              const alloc = carStdAlloc[skill]||0;
              return (
                <div key={skill} className="flex items-center my-1 space-x-4">
                  <div className="w-40">{skill} (base {base}%)</div>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={alloc}
                    onChange={handleCarStd(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{alloc}%</div>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <h4 className="font-bold">Professional Skills (pick up to 3)</h4>
            {(careerDef.professionalSkills || []).map(skill => {
              const base = baseProfessional[skill]||0;
              const alloc = profAlloc[skill]||0;
              const checked = profSel.includes(skill);
              return (
                <div key={skill} className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProf(skill)}
                      className="mr-2"
                    />
                    {skill} (base {base}%)
                  </label>
                  {checked && (
                    <div className="flex items-center my-1 space-x-4">
                      <input
                        type="range"
                        min={0}
                        max={maxInc}
                        step={1}
                        value={alloc}
                        onChange={handleProf(skill)}
                        className="flex-1"
                      />
                      <div className="w-12 text-right">+{alloc}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary mt-4"
            disabled={carLeft > 0}
            onClick={() => setStep(3)}
          >
            Next: Bonus / Hobby
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Step 3: Bonus / Hobby Skills ({bonusLeft} pts left)</h3>
          <div className="mt-4">
            <label className="block mb-2">Add Hobby Skill:</label>
            <select
              value=""
              onChange={e => {
                const s = e.target.value;
                if (!s || bonusSel.includes(s)) return;
                setBonusSel(sel => [...sel, s]);
              }}
              className="form-control"
            >
              <option disabled value="">-- pick a skill --</option>
              {[...new Set([
                ...(cultureDef.standardSkills||[]),
                ...(cultureDef.professionalSkills||[]),
                ...(careerDef.standardSkills||[]),
                ...(careerDef.professionalSkills||[]),
              ])].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {bonusSel.map(skill => {
              const base = baseStandard[skill] || baseProfessional[skill] || 0;
              const alloc = bonusAlloc[skill] || 0;
              return (
                <div key={skill} className="flex items-center my-3 space-x-4">
                  <div className="w-40">{skill} (base {base}%)</div>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={alloc}
                    onChange={handleBonus(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{alloc}%</div>
                </div>
              );
            })}

          </div>
          <button
            className="btn btn-success mt-4"
            disabled={bonusLeft > 0}
            onClick={() => setStep(4)}
          >
            Done
          </button>
        </>
      )}
    </StepWrapper>
  );
}
