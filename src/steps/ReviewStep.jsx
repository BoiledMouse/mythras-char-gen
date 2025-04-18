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
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${character.name || 'character'}.pdf`);
  };

  const printPage = () => window.print();

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button onClick={downloadJSON} className="px-4 py-2 bg-green-600 text-white rounded">
          Download JSON
        </button>
        <button onClick={exportPDF} className="px-4 py-2 bg-blue-600 text-white rounded">
          Export PDF
        </button>
        <button onClick={printPage} className="px-4 py-2 bg-gray-600 text-white rounded">
          Print
        </button>
      </div>
      <div id="review-content" className="bg-gray-100 p-4 rounded">
        <pre className="whitespace-pre-wrap">{JSON.stringify(character, null, 2)}</pre>
      </div>
    </div>
  );
}
