// src/steps/ReviewStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ReviewStep() {
  const { character } = useCharacter();

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    saveAs(blob, `${character.name || 'character'}.json`);
  };

  const exportPDF = async () => {
    const input = document.getElementById('review-content');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${character.name || 'character'}.pdf`);
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button onClick={downloadJSON} className="px-4 py-2 bg-green-600 text-white rounded">
          Download JSON
        </button>
        <button onClick={exportPDF} className="px-4 py-2 bg-blue-600 text-white rounded">
          Export PDF
        </button>
      </div>

      <div id="review-content" className="bg-white p-6 rounded-lg shadow prose prose-lg prose-indigo">
        <h1>{character.name || 'Unnamed Character'}</h1>
        <p><strong>Player:</strong> {character.player}</p>
        <p><strong>Culture:</strong> {character.culture}</p>
        <p><strong>Career:</strong> {character.career}</p>

        <h2>Attributes</h2>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Attribute</th><th>Value</th>
            </tr>
          </thead>
          <tbody>
            {['STR','CON','DEX','POW','CHA','INT','SIZ'].map(attr => (
              <tr key={attr}>
                <td className="font-medium">{attr}</td>
                <td>{character[attr]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Skills</h2>
        <h3>Cultural</h3>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Skill</th><th>Base</th><th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {character.selectedCult?.map(s => (
              <tr key={s}>
                <td>{s}</td>
                <td>{character.baseStandard[s]}</td>
                <td>{character.cultAlloc?.[s] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Career & Professional</h3>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Skill</th><th>Base</th><th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {character.careerStandardSkills?.map(s => (
              <tr key={s}>
                <td>{s}</td>
                <td>{character.baseStandard[s]}</td>
                <td>{character.careerAlloc?.[s] || 0}</td>
              </tr>
            ))}
            {character.selectedProf?.map(s => (
              <tr key={s}>
                <td>{s}</td>
                <td>{character.baseProfessional[s]}</td>
                <td>{character.careerAlloc?.[s] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Bonus</h3>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Skill</th><th>Base</th><th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(character.baseStandard).map(s => (
              <tr key={s}>
                <td>{s}</td>
                <td>{character.baseStandard[s]}</td>
                <td>{character.bonusAlloc?.[s] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Equipment</h2>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(character.equipmentAlloc || {}).map(([name, qty]) => qty > 0 && (
              <tr key={name}>
                <td>{name}</td>
                <td>{qty}</td>
                <td>{(character.equipmentList.find(e=>e.name===name)?.cost||0)*qty} SP</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Derived Stats</h2>
        <ul>
          <li><strong>Action Points:</strong> {character.actionPoints}</li>
          <li><strong>Damage Modifier:</strong> {character.damageMod}</li>
          <li><strong>XP Modifier:</strong> {character.experienceMod}</li>
          <li><strong>Healing Rate:</strong> {character.healingRate}</li>
          <li><strong>Magic Points:</strong> {character.POW}</li>
          <li><strong>Luck Points:</strong> {character.luckPoints}</li>
        </ul>
      </div>
    </div>
  );
}
