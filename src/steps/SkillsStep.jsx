// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter }     from '../context/characterContext';
import cultures             from '../data/cultures.json';
import careers              from '../data/careers.json';
import skillsData           from '../data/skills.json';
import StepWrapper          from '../components/StepWrapper';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const {
    culture: cultKey,
    career:  careerKey,
    age = 0,
    STR = 0,
    DEX = 0,
    CON = 0,
    SIZ = 0,
    INT = 0,
    POW = 0,
    CHA = 0,
  } = character;

  const cultureDef = cultures[cultKey] || {};
  const careerDef = careers[careerKey] || {};

  // 1) Age buckets from the PDF:
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: initialPool, maxInc } =
    ageBuckets.find(b => age <= b.max);

  // 2) Compute base skill% as per Chapter 4 “Skills”:
  const a = { STR, DEX, CON, SIZ, INT, POW, CHA };
  const computeBase = expr => {
    // expr is like "STR+DEX" or "INTx2"
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = Number(a[parts[0]] || 0);
    for (let i = 1; i < parts.length; i += 2) {
      const op  = parts[i];
      const tok = parts[i+1];
      const num = /^\d+$/.test(tok) ? Number(tok) : Number(a[tok] || 0);
      val = op === 'x' ? val * num : val + num;
    }
    return val;
  };

  // 3) Build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let v = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') v += 40;
    baseStandard[name] = v;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Which skills come from culture/career?
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Phase control + allocation state
  const [phase,        setPhase      ] = useState(1);
  const [poolLeft,     setPoolLeft   ] = useState(initialPool);
  const [cultStdAlloc, setCultStdAlloc] = useState({});
  const [cultProfAlloc,setCultProfAlloc]= useState({});
  const [cultCombat,   setCultCombat ] = useState({ style: null, pts: 0 });

  const [carStdAlloc,  setCarStdAlloc ] = useState({});
  const [carProfAlloc, setCarProfAlloc] = useState({});

  const [bonusSel,     setBonusSel   ] = useState([]);
  const [bonusAlloc,   setBonusAlloc ] = useState({});

  // helper
  const sum = obj => Object.values(obj).reduce((a,b)=>(a+b||0),0);

  // 6) When the user finishes Phase 3, commit to context:
  useEffect(() => {
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      // culture
      cultStd.forEach(s => final[s] += cultStdAlloc[s]||0);
      cultProf.forEach(s=> final[s] += cultProfAlloc[s]||0);
      if (cultCombat.style) final[cultCombat.style] += cultCombat.pts;
      // career
      carStd.forEach(s => final[s] += carStdAlloc[s]||0);
      carProf.forEach(s=> final[s] += carProfAlloc[s]||0);
      // bonus
      bonusSel.forEach(s => final[s] += bonusAlloc[s]||0);

      updateCharacter({ skills: final });
    }
  }, [phase]);

  // 7) Allocation handler (snaps 1–4 to 0, clamps to [0..maxInc], drains pool)
  const handleAlloc = (alloc, setAlloc) => skill => e => {
    let v = parseInt(e.target.value, 10) || 0;
    if (v > 0 && v < 5) v = 0;
    v = Math.max(0, Math.min(maxInc, v));
    const prev = alloc[skill]||0, delta = v - prev;
    if (delta <= poolLeft) {
      setAlloc({ ...alloc, [skill]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒ Starting Pool: <strong>{initialPool}</strong> pts,  
        Max per skill: <strong>+{maxInc}</strong>
      </p>
      <p>Remaining points: <strong>{poolLeft}</strong></p>

      {phase === 1 && (
        <>
          <h3 className="italic">Step 1: Cultural Skills</h3>
          <p>Distribute among your culture’s skills:</p>

          <div className="space-y-4">
            {cultStd.map(s => (
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseStandard[s]}%)</label>
                <input
                  type="number"
                  min={0} max={maxInc}
                  value={cultStdAlloc[s]||0}
                  onChange={handleAlloc(cultStdAlloc, setCultStdAlloc)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {cultProf.map(s => (
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseProfessional[s]}%)</label>
                <input
                  type="number"
                  min={0} max={maxInc}
                  value={cultProfAlloc[s]||0}
                  onChange={handleAlloc(cultProfAlloc, setCultProfAlloc)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {/* Combat Style if any */}
            {cultureDef.combatStyles?.length > 0 && (
              <>
                <label className="block mt-4 font-medium">Combat Style</label>
                {cultureDef.combatStyles.map(style => (
                  <div key={style} className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="combatStyle"
                      checked={cultCombat.style === style}
                      onChange={() => setCultCombat({ style, pts: 0 })}
                    />
                    <label className="w-40">{style} (Base {baseProfessional[style]||0}%)</label>
                    {cultCombat.style === style && (
                      <input
                        type="number"
                        min={0} max={maxInc}
                        value={cultCombat.pts}
                        onChange={e => {
                          let v = parseInt(e.target.value,10)||0;
                          v = Math.max(0, Math.min(maxInc, v));
                          const delta = v - (cultCombat.pts||0);
                          if (delta <= poolLeft) {
                            setCultCombat({ style, pts: v });
                            setPoolLeft(pl=>pl-delta);
                          }
                        }}
                        className="w-16 border rounded p-1"
                      />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <button
            onClick={() => setPhase(2)}
            className="mt-6 px-4 py-2 bg-gold"
          >
            Next: Career Skills
          </button>
        </>
      )}

      {phase === 2 && (
        <>
          <h3 className="italic">Step 2: Career Skills</h3>
          <p>Distribute among your career’s skills:</p>

          <div className="space-y-4">
            {carStd.map(s => (
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseStandard[s]}%)</label>
                <input
                  type="number"
                  min={0} max={maxInc}
                  value={carStdAlloc[s]||0}
                  onChange={handleAlloc(carStdAlloc, setCarStdAlloc)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {carProf.map(s => (
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseProfessional[s]}%)</label>
                <input
                  type="number"
                  min={0} max={maxInc}
                  value={carProfAlloc[s]||0}
                  onChange={handleAlloc(carProfAlloc, setCarProfAlloc)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setPhase(1)}
              className="px-4 py-2 bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setPhase(3)}
              className="px-4 py-2 bg-gold"
            >
              Next: Bonus Skills
            </button>
          </div>
        </>
      )}

      {phase === 3 && (
        <>
          <h3 className="italic">Step 3: Age‐based Bonus Skills</h3>
          <p>Add up to <strong>{initialPool}</strong> points (max +{maxInc} each).</p>

          {/* Hobby selector */}
          <div className="mt-4">
            <label className="block font-medium">Add Hobby Skill</label>
            <select
              className="w-full border rounded p-2"
              onChange={e => {
                const s = e.target.value;
                if (s && !bonusSel.includes(s)) {
                  setBonusSel(sel => [...sel, s]);
                }
              }}
            >
              <option value="">— pick a skill —</option>
              {[...cultStd, ...cultProf, ...carStd, ...carProf]
                .filter((v,i,a)=>v && a.indexOf(v)===i)
                .map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-4 mt-4">
            {bonusSel.map(skill => {
              const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
              const extra = bonusAlloc[skill] || 0;
              return (
                <div key={skill} className="flex items-center space-x-4">
                  <label className="w-48">
                    {skill} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={extra}
                    onChange={handleAlloc(bonusAlloc, setBonusAlloc)(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{extra}%</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setPhase(2)}
              className="px-4 py-2 bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={() => setPhase(4)}
              className="px-4 py-2 bg-green-600 text-white"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
