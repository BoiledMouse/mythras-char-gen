// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep({ formData }) {
  // grab rolled/bought attributes from context
  const { character, updateCharacter } = useCharacter();
  const {
    STR = 0,
    DEX = 0,
    INT = 0,
    CON = 0,
    POW = 0,
    CHA = 0,
    SIZ = 0,
  } = character;

  // pull culture, career and age from the formData passed in
  const {
    culture: cultKey = '',
    career: careerKey = '',
    age = 0,
  } = formData;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // age‐based bonus bucket
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool, maxInc } =
    ageBuckets.find(b => age <= b.max);

  // helper to compute a base value from "STR+DEX" or "INTx2"
  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v  = /^\d+$/.test(tok) ? +tok : attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // which skills apply?
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills || [];

  // fixed cultural & career pools
  const CULT_POOL   = 100;
  const CAREER_POOL = 100;

  // wizard phases
  const [phase,      setPhase     ] = useState(1);

  // cultural allocations
  const [cStdAlloc,    setCStdAlloc   ] = useState({});
  const [cProfSel,     setCProfSel    ] = useState([]);
  const [cProfAlloc,   setCProfAlloc  ] = useState({});
  const [cCombatSel,   setCCombatSel  ] = useState('');
  const [cCombatAlloc, setCCombatAlloc] = useState(0);

  // career allocations
  const [rStdAlloc,  setRStdAlloc ] = useState({});
  const [rProfSel,   setRProfSel  ] = useState([]);
  const [rProfAlloc, setRProfAlloc] = useState({});

  // bonus allocations
  const [bonusSel,   setBonusSel ] = useState([]);
  const [bonusAlloc, setBonusAlloc] = useState({});
  const [bonusLeft,  setBonusLeft] = useState(initialBonusPool);

  const sum = o => Object.values(o).reduce((a,v)=>(a + (v||0)), 0);

  // persist on finish
  useEffect(() => {
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd.forEach(s => final[s] += cStdAlloc[s]||0);
      cProfSel.forEach(s => final[s] += cProfAlloc[s]||0);
      if (cCombatSel) final[cCombatSel] += cCombatAlloc;
      carStd.forEach(s => final[s] += rStdAlloc[s]||0);
      rProfSel.forEach(s => final[s] += rProfAlloc[s]||0);
      bonusSel.forEach(s => final[s] += bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  }, [phase]);

  // generic slider handler
  const handleSlider = (setter, allocObj, key, poolLeft, setPool, limit) => e => {
    let v = parseInt(e.target.value,10) || 0;
    v = Math.max(0, Math.min(limit, v));
    const prev = allocObj[key]||0, delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPool(pl => pl - delta);
    }
  };

  // bonus slider
  const handleBonus = skill => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v>0 && v<5) v = 0;
    v = Math.max(0, Math.min(maxInc, v));
    const prev = bonusAlloc[skill]||0, delta = v - prev;
    if (delta <= bonusLeft) {
      setBonusAlloc(a => ({ ...a, [skill]: v }));
      setBonusLeft(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> &nbsp;
        Cultural: <strong>100</strong> pts &nbsp;
        Career:  <strong>100</strong> pts &nbsp;
        Bonus:   <strong>{initialBonusPool}</strong> pts &nbsp;
        Max per skill: +{maxInc}%
      </p>

      {/* Cultural */}
      {phase===1 && <>
        <h3>Cultural Skills</h3>
        <p>Points left: <strong>
          {CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombatAlloc}
        </strong></p>

        <h4>Standard</h4>
        {cultStd.map(s => (
          <div key={s} className="flex items-center mb-2">
            <span className="w-40">{s} (Base {baseStandard[s]}%)</span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={cStdAlloc[s]||0}
              onChange={handleSlider(
                setCStdAlloc,
                cStdAlloc,
                s,
                CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombatAlloc,
                v=>v,
                maxInc
              )}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{cStdAlloc[s]||0}</span>
          </div>
        ))}

        <h4>Professional (max 3)</h4>
        {cultProf.map(s => (
          <label key={s} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={cProfSel.includes(s)}
              onChange={() => {
                setCProfSel(sel =>
                  sel.includes(s)
                    ? sel.filter(x=>x!==s)
                    : sel.length<3 ? [...sel,s] : sel
                );
              }}
              className="mr-1"
            />
            {s}
          </label>
        ))}
        {cProfSel.map(s => (
          <div key={s} className="flex items-center mb-2">
            <span className="w-40">{s} (Base {baseProfessional[s]}%)</span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={cProfAlloc[s]||0}
              onChange={handleSlider(
                setCProfAlloc,
                cProfAlloc,
                s,
                CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombatAlloc,
                v=>v,
                maxInc
              )}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{cProfAlloc[s]||0}</span>
          </div>
        ))}

        <h4>Combat Style</h4>
        {cultureDef.combatStyles?.map(cs => (
          <label key={cs} className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="comb"
              checked={cCombatSel===cs}
              onChange={()=> setCCombatSel(cs)}
              className="mr-1"
            />
            {cs}
          </label>
        ))}
        {cCombatSel && (
          <div className="flex items-center mb-4">
            <span className="w-40">
              {cCombatSel} (Base {baseProfessional[cCombatSel]}%)
            </span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={cCombatAlloc}
              onChange={handleSlider(
                _=>setCCombatAlloc,
                { [cCombatSel]: cCombatAlloc },
                cCombatSel,
                CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombatAlloc,
                v=>v,
                maxInc
              )}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{cCombatAlloc}</span>
          </div>
        )}

        <button onClick={()=>setPhase(2)} className="btn btn-primary">
          Next: Career
        </button>
      </>}

      {/* Career */}
      {phase===2 && <>
        <h3>Career Skills</h3>
        <p>Points left: <strong>
          {CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc)}
        </strong></p>

        <h4>Standard</h4>
        {carStd.map(s => (
          <div key={s} className="flex items-center mb-2">
            <span className="w-40">{s} (Base {baseStandard[s]}%)</span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={rStdAlloc[s]||0}
              onChange={handleSlider(
                setRStdAlloc,
                rStdAlloc,
                s,
                CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc),
                v=>v,
                maxInc
              )}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{rStdAlloc[s]||0}</span>
          </div>
        ))}

        <h4>Professional (max 3)</h4>
        {carProf.map(s => (
          <label key={s} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={rProfSel.includes(s)}
              onChange={()=>{
                setRProfSel(sel =>
                  sel.includes(s)
                    ? sel.filter(x=>x!==s)
                    : sel.length<3 ? [...sel,s] : sel
                );
              }}
              className="mr-1"
            />
            {s}
          </label>
        ))}
        {rProfSel.map(s => (
          <div key={s} className="flex items-center mb-2">
            <span className="w-40">{s} (Base {baseProfessional[s]}%)</span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={rProfAlloc[s]||0}
              onChange={handleSlider(
                setRProfAlloc,
                rProfAlloc,
                s,
                CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc),
                v=>v,
                maxInc
              )}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{rProfAlloc[s]||0}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button onClick={()=>setPhase(1)} className="btn btn-secondary">
            Back
          </button>
          <button onClick={()=>setPhase(3)} className="btn btn-primary">
            Next: Bonus
          </button>
        </div>
      </>}

      {/* Bonus */}
      {phase===3 && <>
        <h3>Bonus Skills</h3>
        <p>Points left: <strong>{bonusLeft}</strong></p>

        <h4>Add Hobby</h4>
        <select
          className="form-control mb-4"
          onChange={e=>{
            const s = e.target.value;
            if (s && !bonusSel.includes(s))
              setBonusSel(sel => [...sel,s]);
          }}
        >
          <option value="">-- pick skill --</option>
          {[...new Set([...cultStd, ...cultProf, ...carStd, ...carProf])]
            .map(s=><option key={s} value={s}>{s}</option>)}
        </select>

        {bonusSel.map(s=>(
          <div key={s} className="flex items-center mb-2">
            <span className="w-40">
              {s} (Base {baseStandard[s] ?? baseProfessional[s]}%)
            </span>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={bonusAlloc[s]||0}
              onChange={handleBonus(s)}
              className="flex-1 mx-2"
            />
            <span className="w-12 text-right">+{bonusAlloc[s]||0}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button onClick={()=>setPhase(2)} className="btn btn-secondary">
            Back
          </button>
          <button
            onClick={()=>setPhase(4)}
            disabled={bonusLeft>0}
            className="btn btn-success"
          >
            Finish
          </button>
        </div>
      </>}

      {phase>3 && (
        <div className="text-center"><h3>All set!</h3></div>
      )}
    </StepWrapper>
  );
}
