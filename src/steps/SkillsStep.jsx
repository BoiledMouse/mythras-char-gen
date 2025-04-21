// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const { culture: cultKey, career: careerKey, age = 0 } = character;
  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 1) Age‐based bucket for bonus phase
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: BONUS_POINTS, maxInc: BONUS_MAX } =
    ageBuckets.find(b => age <= b.max) || ageBuckets[0];

  // 2) Compute base % from attribute formulas
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(character[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +(character[tok] || 0);
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) Build base tables
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

  // 4) Which skills to show?
  const cultStd  = cultureDef.standardSkills     || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills      || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Phase and pools
  const [phase, setPhase] = useState(1);
  const CULT_POINTS   = 100;
  const CAREER_POINTS = 100;
  const [poolCult,   setPoolCult]   = useState(CULT_POINTS);
  const [poolCareer, setPoolCareer] = useState(CAREER_POINTS);
  const [poolBonus,  setPoolBonus]  = useState(BONUS_POINTS);

  // 6) Allocation state
  const [cultStdAlloc,    setCultStdAlloc]    = useState({});
  const [cultProfSel,     setCultProfSel]     = useState([]);
  const [cultProfAlloc,   setCultProfAlloc]   = useState({});
  const [careerStdAlloc,  setCareerStdAlloc]  = useState({});
  const [careerProfSel,   setCareerProfSel]   = useState([]);
  const [careerProfAlloc, setCareerProfAlloc] = useState({});
  const [bonusSel,        setBonusSel]        = useState([]);
  const [bonusAlloc,      setBonusAlloc]      = useState({});

  // common clamp & snap handler
  const handleAlloc = (setter, allocObj, key, pool, setPool, maxInc) => e => {
    let v = parseInt(e.target.value, 10) || 0;
    if (v > 0 && v < 5) v = 0;                // snap tiny values to 0
    v = Math.min(maxInc, Math.max(0, v));     // clamp
    const prev = allocObj[key] || 0;
    const delta = v - prev;
    if (delta <= pool) {
      setter({ ...allocObj, [key]: v });
      setPool(p => p - delta);
    }
  };

  // 7) Once bonus pool zero, commit all skills
  useEffect(() => {
    if (phase === 3 && poolBonus === 0) {
      const final = { ...baseStandard, ...baseProfessional };
      // cultural
      cultStd.forEach(s => final[s] += cultStdAlloc[s] || 0);
      cultProfSel.forEach(s => final[s] += cultProfAlloc[s] || 0);
      // career
      carStd.forEach(s => final[s] += careerStdAlloc[s] || 0);
      careerProfSel.forEach(s => final[s] += careerProfAlloc[s] || 0);
      // bonus hobbies
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);

      updateCharacter({ skills: final, step: 'skillsDone' });
    }
  }, [poolBonus, phase]);

  return (
    <StepWrapper title="Skills">
      {/* Phase tabs */}
      <div className="flex space-x-4 mb-4">
        {['Cultural','Career','Bonus'].map((label, i) => (
          <button
            key={label}
            className={`px-3 py-1 border-b-2 ${
              phase === i+1 ? 'border-blue-600 font-semibold' : 'border-transparent'
            }`}
            onClick={() => setPhase(i+1)}
            disabled={i+1 > phase}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Phase 1: Cultural */}
      {phase === 1 && (
        <div className="space-y-6">
          <p>Pool: <strong>{poolCult}</strong> pts (max +15 each)</p>

          <h4 className="font-medium">Standard Skills</h4>
          {cultStd.map(s => {
            const base = baseStandard[s] || 0, extra = cultStdAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block font-medium">
                    {s} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCultStdAlloc, cultStdAlloc, s,
                      poolCult, setPoolCult, 15
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">+{extra}%</div>
              </div>
            );
          })}

          <h4 className="font-medium">Professional Skills (up to 3)</h4>
          <div className="flex flex-wrap gap-2">
            {cultProf.map(s => (
              <label key={s} className="inline-flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={cultProfSel.includes(s)}
                  onChange={() => {
                    setCultProfSel(sel =>
                      sel.includes(s)
                        ? sel.filter(x => x !== s)
                        : sel.length < 3
                          ? [...sel, s]
                          : sel
                    );
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>

          {cultProfSel.map(s => {
            const base = baseProfessional[s] || 0, extra = cultProfAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4 mt-2">
                <div className="flex-1">
                  <label className="block font-medium">
                    {s} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCultProfAlloc, cultProfAlloc, s,
                      poolCult, setPoolCult, 15
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">+{extra}%</div>
              </div>
            );
          })}

          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            disabled={poolCult > 0}
            onClick={() => setPhase(2)}
          >
            Next: Career
          </button>
        </div>
      )}

      {/* Phase 2: Career */}
      {phase === 2 && (
        <div className="space-y-6">
          <p>Pool: <strong>{poolCareer}</strong> pts (max +15 each)</p>

          <h4 className="font-medium">Standard Skills</h4>
          {carStd.map(s => {
            const base = baseStandard[s] || 0, extra = careerStdAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block font-medium">
                    {s} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCareerStdAlloc, careerStdAlloc, s,
                      poolCareer, setPoolCareer, 15
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">+{extra}%</div>
              </div>
            );
          })}

          <h4 className="font-medium">Professional Skills (up to 3)</h4>
          <div className="flex flex-wrap gap-2">
            {carProf.map(s => (
              <label key={s} className="inline-flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={careerProfSel.includes(s)}
                  onChange={() => {
                    setCareerProfSel(sel =>
                      sel.includes(s)
                        ? sel.filter(x => x !== s)
                        : sel.length < 3
                          ? [...sel, s]
                          : sel
                    );
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>

          {careerProfSel.map(s => {
            const base = baseProfessional[s] || 0, extra = careerProfAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4 mt-2">
                <div className="flex-1">
                  <label className="block font-medium">
                    {s} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCareerProfAlloc, careerProfAlloc, s,
                      poolCareer, setPoolCareer, 15
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">+{extra}%</div>
              </div>
            );
          })}

          <div className="flex space-x-4 mt-6">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setPhase(1)}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={poolCareer > 0}
              onClick={() => setPhase(3)}
            >
              Next: Bonus
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: Bonus */}
      {phase === 3 && (
        <div className="space-y-6">
          <p>
            Age: <strong>{age}</strong> ⇒ Starting Pool: <strong>{BONUS_POINTS}</strong> pts, Max per skill: <strong>+{BONUS_MAX}</strong>
          </p>
          <p>Remaining Pool: <strong>{poolBonus}</strong> pts</p>

          {bonusSel.map(s => {
            const base = baseStandard[s] || baseProfessional[s] || 0;
            const extra = bonusAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block font-medium">
                    {s} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={BONUS_MAX} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setBonusAlloc, bonusAlloc, s,
                      poolBonus, setPoolBonus, BONUS_MAX
                    )}
                    className="w-full"
                  />
                </div>
                <div className="w-16 text-right">+{extra}%</div>
              </div>
            );
          })}

          <div className="mt-6">
            <label className="block mb-1 font-medium">Add Hobby Skill:</label>
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
                .filter((v,i,a) => v && a.indexOf(v) === i)
                .map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}
    </StepWrapper>
  );
}
