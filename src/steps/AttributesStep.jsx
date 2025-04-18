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
  const initialAlloc = {
    STR: character.STR || 3,
    CON: character.CON || 3,
    DEX: character.DEX || 3,
    POW: character.POW || 3,
    CHA: character.CHA || 3,
    INT: character.INT || 8,
    SIZ: character.SIZ || 8,
  };
  const [alloc, setAlloc] = useState(initialAlloc);
  const [rolls, setRolls] = useState({});

  useEffect(() => updateCharacter(alloc), [alloc]);

  const sum = vals => Object.values(vals).reduce((a, b) => a + b, 0);
  const pointsLeft = maxPoints - sum(alloc);

  // derive attributes (unchanged)
  const actionPoints = (() => { const t=alloc.INT+alloc.DEX; let e=apTable.find(r=>t>=r.min&&t<=r.max); if(!e){const l=apTable[apTable.length-1];return l.points+Math.floor((t-l.max)/12);}return e.points; })();
  const damageMod = dmgTable.find(r=>alloc.STR+alloc.SIZ>=r.min&&alloc.STR+alloc.SIZ<=r.max)?.modifier||'';
  const experienceMod = (()=>{let e=expTable.find(r=>alloc.CHA>=r.min&&alloc.CHA<=r.max); if(!e){const l=expTable[expTable.length-1];return l.modifier+Math.floor((alloc.CHA-l.max)/6);}return e.modifier;})();
  const healingRate = (()=>{let e=healTable.find(r=>alloc.CON>=r.min&&alloc.CON<=r.max); if(!e){const l=healTable[healTable.length-1];return l.rate+Math.floor((alloc.CON-l.max)/6);}return e.rate;})();
  const luckPoints = (()=>{let e=luckTable.find(r=>alloc.POW>=r.min&&alloc.POW<=r.max); if(!e){const l=luckTable[luckTable.length-1];return l.points+Math.floor((alloc.POW-l.max)/6);}return e.points;})();
  const initiative = Math.floor((alloc.INT+alloc.DEX)/2);
  const magicPoints = alloc.POW;
  const hpPerLoc = alloc.CON + alloc.SIZ;
  const movement = '6m';

  // dice roll helpers
  const rollDie = () => Math.ceil(Math.random()*6);
  const roll3d6 = () => [rollDie(), rollDie(), rollDie()];
  const roll2d6p6 = () => [rollDie(), rollDie()].concat([6]);
  const rollAttributes = () => {
    const newRolls = {
      STR: roll3d6(),
      CON: roll3d6(),
      DEX: roll3d6(),
      POW: roll3d6(),
      CHA: roll3d6(),
      INT: roll2d6p6(),
      SIZ: roll2d6p6(),
    };
    const newAlloc = {};
    Object.entries(newRolls).forEach(([k, arr]) => {
      newAlloc[k] = arr.reduce((a,b)=>a+b,0);
    });
    setRolls(newRolls);
    setAlloc(newAlloc);
  };

  const handleChange = (attr, delta) => {
    setAlloc(prev => {
      const min = ['INT','SIZ'].includes(attr) ? 8 : 3;
      let v = (prev[attr]||0) + delta;
      if(v<min) v=min;
      if(v>18) v=18;
      if(v - prev[attr] > pointsLeft) v=prev[attr];
      return {...prev, [attr]:v};
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="inline-flex items-center">
          <input type="radio" checked={method==='roll'} onChange={()=>setMethod('roll')} className="mr-2" /> Roll Attributes
        </label>
        <label className="inline-flex items-center ml-6">
          <input type="radio" checked={method==='point'} onChange={()=>setMethod('point')} className="mr-2" /> Point Buy
        </label>
        {method==='point' && (
          <div className="mt-2">
            <label>Total Points:</label>
            <input type="number" min={0} value={maxPoints} onChange={e=>setMaxPoints(+e.target.value||0)} className="w-20 ml-2 border-gray-300 rounded" />
            <span className="ml-4">Left: {pointsLeft}</span>
          </div>
        )}
      </div>

      {method==='roll' ? (
        <div className="space-y-4">
          <button onClick={rollAttributes} className="px-4 py-2 bg-green-600 text-white rounded">Roll</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(alloc).map(k=> (
              <div key={k} className="border p-3 rounded">
                <h4 className="font-semibold">{k}</h4>
                <p className="text-sm">Rolled: {rolls[k]?.join(' + ') || '-'}</p>
                <p className="text-xl font-bold">Total: {alloc[k]}</p>
              </div>
            ))}
        </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(alloc).map(k=>{
            const min = ['INT','SIZ'].includes(k)?8:3;
            return (
              <div key={k} className="flex items-center">
                <span className="w-12 font-medium">{k}</span>
                <button onClick={()=>handleChange(k,-1)} className="px-2">-</button>
                <input
                  type="number"
                  min={min} max={18}
                  value={alloc[k]}
                  readOnly
                  className="mx-2 w-16 text-center border-gray-300 rounded"
                />
                <button onClick={()=>handleChange(k,1)} className="px-2">+</button>
              </div>
            );
          })}
          <div className="col-span-full mt-2">Points Left: {pointsLeft}</div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h3 className="font-semibold">Derived Attributes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
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
