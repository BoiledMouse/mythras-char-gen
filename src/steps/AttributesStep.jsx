// src/steps/AttributesStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import apTable from '../data/tables/actionPoints.json';
import dmgTable from '../data/tables/damageModifiers.json';
import expTable from '../data/tables/experienceModifiers.json';
import healTable from '../data/tables/healingRate.json';
import luckTable from '../data/tables/luckPoints.json';

export function AttributesStep() {
  const { character, updateCharacter } = useCharacter();
  const [method, setMethod] = useState('roll');
  const [maxPoints, setMaxPoints] = useState(80);
  const [alloc, setAlloc] = useState({
    STR: character.STR,
    CON: character.CON,
    DEX: character.DEX,
    POW: character.POW,
    CHA: character.CHA,
    INT: character.INT,
    SIZ: character.SIZ,
  });

  useEffect(() => updateCharacter(alloc), [alloc]);

  const sum = vals => Object.values(vals).reduce((a, b) => a + b, 0);
  const pointsLeft = maxPoints - sum(alloc);

  // Derived attributes
  const actionPoints = (() => { 
    const t = alloc.INT + alloc.DEX;
    let e = apTable.find(r => (r.min || 0) <= t && t <= r.max);
    if (!e) {
      const l = apTable[apTable.length - 1];
      const extra = Math.floor((t - l.max) / 12);
      return l.points + extra;
    }
    return e.points;
  })();
  const damageMod = (() => {
    const t = alloc.STR + alloc.SIZ;
    return dmgTable.find(r => (r.min || 0) <= t && t <= r.max)?.modifier || '';
  })();
  const experienceMod = (() => {
    let e = expTable.find(r => (r.min || 0) <= alloc.CHA && alloc.CHA <= r.max);
    if (!e) {
      const l = expTable[expTable.length - 1];
      const extra = Math.floor((alloc.CHA - l.max) / 6);
      return l.modifier + extra;
    }
    return e.modifier;
  })();
  const healingRate = (() => {
    let e = healTable.find(r => (r.min || 0) <= alloc.CON && alloc.CON <= r.max);
    if (!e) {
      const l = healTable[healTable.length - 1];
      const extra = Math.floor((alloc.CON - l.max) / 6);
      return l.rate + extra;
    }
    return e.rate;
  })();
  const luckPoints = (() => {
    let e = luckTable.find(r => (r.min || 0) <= alloc.POW && alloc.POW <= r.max);
    if (!e) {
      const l = luckTable[luckTable.length - 1];
      const extra = Math.floor((alloc.POW - l.max) / 6);
      return l.points + extra;
    }
    return e.points;
  })();
  const initiative = Math.floor((alloc.INT + alloc.DEX) / 2);
  const magicPoints = alloc.POW;
  const hpPerLoc = alloc.CON + alloc.SIZ;
  const movement = '6m';

  // Roll helpers
  const roll3 = () => Array.from({ length: 3 }, () => Math.ceil(Math.random() * 6)).reduce((a, b) => a + b, 0);
  const roll2p6p6 = () => roll3() + roll3() - 6 + 6;
  const rollAttrs = () => setAlloc({
    STR: roll3(),
    CON: roll3(),
    DEX: roll3(),
    POW: roll3(),
    CHA: roll3(),
    INT: roll2p6p6(),
    SIZ: roll2p6p6()
  });
  const handleChange = (attr, val) => {
    let v = parseInt(val, 10);
    const min = ['INT', 'SIZ'].includes(attr) ? 8 : 3;
    if (isNaN(v) || v < min || v > 18) v = alloc[attr];
    if (v - alloc[attr] > pointsLeft) v = alloc[attr];
    setAlloc(prev => ({ ...prev, [attr]: v }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label><input type="radio" checked={method === 'roll'} onChange={() => setMethod('roll')} className="mr-1" /> Roll Attributes</label>
        <label className="ml-4"><input type="radio" checked={method === 'point'} onChange={() => setMethod('point')} className="mr-1" /> Point Buy</label>
        {method === 'point' && (
          <div className="mt-2">
            <label>Total Points:</label>
            <input type="number" min={0} value={maxPoints} onChange={e => setMaxPoints(+e.target.value || 0)} className="w-20 border-gray-300 rounded ml-2" />
          </div>
        )}
      </div>
      {method === 'roll' ? (
        <div>
          <button onClick={rollAttrs} className="px-3 py-1 bg-green-600 text-white rounded">Roll</button>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(alloc).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {v}</div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div>Points Left: {pointsLeft}</div>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {Object.keys(alloc).map(k => {
              const min = ['INT', 'SIZ'].includes(k) ? 8 : 3;
              return (
                <div key={k}>
                  <label>{k} (min {min})</label>
                  <input type="number" value={alloc[k]} onChange={e => handleChange(k, e.target.value)} className="mt-1 w-20 border-gray-300 rounded" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="pt-4 border-t">
        <h3 className="font-semibold">Derived Attributes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          <div>Action Points: {actionPoints}</div>
          <div>Damage Mod: {damageMod}</div>
          <div>XP Mod: {experienceMod >= 0 ? `+${experienceMod}` : experienceMod}</div>
          <div>Healing Rate: {healingRate}</div>
          <div>Movement: {movement}</div>
          <div>HP/Loc: {hpPerLoc}</div>
          <div>Initiative: {initiative}</div>
          <div>Magic Points: {magicPoints}</div>
          <div>Luck Points: {luckPoints}</div>
        </div>
      </div>
    </div>
  );
}
