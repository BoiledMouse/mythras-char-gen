// src/steps/ReviewStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';
import equipmentData from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

  const handleChange = e => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Skill categories
  const resistanceList = ['Brawn', 'Endurance', 'Evade', 'Willpower'];
  const allMagicNames = [
    ...(skillsData.folkMagic || []).map(s => s.name),
    ...(skillsData.animism || []).map(s => s.name),
    ...(skillsData.mysticism || []).map(s => s.name),
    ...(skillsData.sorcery || []).map(s => s.name),
    ...(skillsData.theism || []).map(s => s.name),
  ];
  const learnedNames = character.skills ? Object.keys(character.skills) : [];
  const selected = character.selectedSkills || {};

  const standardDisplayed = skillsData.standard
    .map(s => s.name)
    .filter(n => !resistanceList.includes(n) && n !== 'Unarmed');
  const resistancesDisplayed = resistanceList.filter(n =>
    learnedNames.includes(n)
  );
  const combatDisplayed = selected.combat || [];
  const professionalDisplayed = selected.professional || [];
  const magicDisplayed = allMagicNames.filter(n =>
    learnedNames.includes(n)
  );

  // Equipment & silver
  const equipmentAlloc = character.equipmentAlloc || {};
  const startingSilver = Number(character.startingSilver) || 0;
  const totalSpent = Object.entries(equipmentAlloc).reduce(
    (sum, [name, qty]) => {
      const item = equipmentData.find(e => e.name === name);
      return sum + (item?.cost || 0) * qty;
    },
    0
  );
  const silverRemaining = startingSilver - totalSpent;
  const equipmentList = Object.entries(equipmentAlloc)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`);

  // HP per location
  const hpSum = (Number(character.CON) || 0) + (Number(character.SIZ) || 0);
  const thresholds = [5, 10, 15, 20, 25, 30, 35, 40];
  const hpTable = {
    Head: [1, 2, 3, 4, 5, 6, 7, 8],
    Chest: [3, 4, 5, 6, 7, 8, 9, 10],
    Abdomen: [2, 3, 4, 5, 6, 7, 8, 9],
    'Each Arm': [1, 1, 2, 3, 4, 5, 6, 7],
    Leg: [1, 2, 3, 4, 5, 6, 7, 8],
  };
  const getHp = key => {
    let idx = thresholds.findIndex(t => hpSum <= t);
    if (idx === -1) idx = thresholds.length - 1;
    let val = hpTable[key][idx];
    if (hpSum > thresholds[thresholds.length - 1]) {
      const extra =
        Math.floor((hpSum - thresholds[thresholds.length - 1] - 1) / 5) + 1;
      val += extra;
    }
    return val;
  };

  // PDF export via @react-pdf/renderer
  const exportPDF = async () => {
    // pass your document element straight into `pdf()`
    const instance = pdf(<CharacterSheetDocument character={character} />);
    const blob = await instance.toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.characterName || 'character'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Markdown export (unchanged)
  const generateMarkdown = () => {
    const lines = [];
    lines.push(`# ${character.characterName || 'Character'}`);
    lines.push(`**Player**: ${character.playerName || ''}`);
    lines.push(`**Sex**: ${character.sex || ''}`);
    lines.push(`**Age**: ${character.age || ''}`);
    lines.push('');
    ['Species','Frame','Height','Weight','Career','Culture','Social Class'].forEach(label => {
      const key = label.charAt(0).toLowerCase() + label.slice(1).replace(/ /g,'');
      lines.push(`**${label}**: ${character[key] || ''}`);
    });
    lines.push('');
    lines.push('## Characteristics');
    ['STR','CON','SIZ','DEX','INT','POW','CHA'].forEach(stat =>
      lines.push(`- **${stat}**: ${character[stat] || ''}`)
    );
    lines.push('');
    lines.push('## Attributes');
    ['actionPoints','damageMod','xpMod','healingRate','initiativeBonus','luckPoints','movementRate'].forEach(label => {
      const pretty = label.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
      lines.push(`- **${pretty}**: ${character[label] || ''}`);
    });
    lines.push('');
    lines.push('## Hit Points per Location');
    [['Head','Head'],['Chest','Chest'],['Abdomen','Abdomen'],['Each Arm','Left Arm'],['Each Arm','Right Arm'],['Leg','Left Leg'],['Leg','Right Leg']].forEach(([k,loc]) => {
      lines.push(`- **${loc}**: ${getHp(k)}`);
    });
    lines.push('');
    lines.push('## Background, Community & Family');
    lines.push(character.backgroundNotes || '');
    lines.push('');
    lines.push('## Contacts, Allies & Enemies');
    lines.push(character.contacts || '');
    lines.push('');
    lines.push('## Money & Equipment');
    lines.push(`- **Silver Remaining**: ${silverRemaining} SP`);
    if (equipmentList.length) {
      lines.push('- **Equipment**:');
      equipmentList.forEach(item => lines.push(`  - ${item}`));
    }
    lines.push('');
    lines.push('## Skills');
    if (standardDisplayed.length) {
      lines.push('### Standard Skills');
      standardDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (resistancesDisplayed.length) {
      lines.push('### Resistances');
      resistancesDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (combatDisplayed.length) {
      lines.push('### Combat Skills');
      combatDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (professionalDisplayed.length) {
      lines.push('### Professional Skills');
      professionalDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (magicDisplayed.length) {
      lines.push('### Magic Skills');
      magicDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    return lines.join('\n');
  };
  const exportMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.characterName || 'character'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StepWrapper title="Review">
      <div className="flex justify-end gap-4 mb-4">
        <button onClick={exportMarkdown} className="btn btn-secondary">
          Export Markdown
        </button>
        <button onClick={exportPDF} className="btn btn-secondary">
          Export PDF
        </button>
      </div>

      <div className="panel-parchment max-w-7xl mx-auto p-6">
        {/* Page 1: Header & Concept */}
        <section className="grid grid-cols-4 gap-4 mb-6">
          {[
            { key: 'playerName', label: 'Player' },
            { key: 'characterName', label: 'Character' },
            { key: 'sex', label: 'Sex' },
            { key: 'age', label: 'Age' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}
              </label>
              <input
                name={f.key}
                value={character[f.key] || ''}
                onChange={handleChange}
                className="form-control mt-1"
              />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-4 gap-4 mb-6">
          {[
            { key: 'species', label: 'Species' },
            { key: 'frame', label: 'Frame' },
            { key: 'height', label: 'Height' },
            { key: 'weight', label: 'Weight' },
            { key: 'career', label: 'Career' },
            { key: 'culture', label: 'Culture' },
            { key: 'socialClass', label: 'Social Class' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}
              </label>
              <input
                name={f.key}
                value={character[f.key] || ''}
                onChange={handleChange}
                className="form-control mt-1"
              />
            </div>
          ))}
        </section>

        {/* Page 1: Characteristics & Attributes */}
        <section className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Characteristics</h3>
            {['STR', 'CON', 'SIZ', 'DEX', 'INT', 'POW', 'CHA'].map(s => (
              <div key={s} className="flex items-center mb-2">
                <span className="w-20 font-medium">{s}</span>
                <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
                  {character[s] || ''}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Attributes</h3>
            {[
              'actionPoints',
              'damageMod',
              'xpMod',
              'healingRate',
              'initiativeBonus',
              'luckPoints',
              'movementRate',
            ].map(key => (
              <div key={key} className="flex items-center mb-2">
                <span className="w-32 font-medium">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, c => c.toUpperCase())}
                </span>
                <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
                  {character[key] != null ? character[key] : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HP per Location */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">HP per Location</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Head', 'Head'],
              ['Chest', 'Chest'],
              ['Abdomen', 'Abdomen'],
              ['Each Arm', 'Left Arm'],
              ['Each Arm', 'Right Arm'],
              ['Leg', 'Left Leg'],
              ['Leg', 'Right Leg'],
            ].map(([k, label]) => (
              <div
                key={label}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>{label}</span>
                <span>{getHp(k)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Background */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <label className="block font-semibold mb-1">
              Background, Community & Family
            </label>
            <textarea
              name="backgroundNotes"
              value={character.backgroundNotes || ''}
              onChange={handleChange}
              rows={4}
              className="form-control mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Contacts, Allies & Enemies
            </label>
            <textarea
              name="contacts"
              value={character.contacts || ''}
              onChange={handleChange}
              rows={4}
              className="form-control mt-1"
            />
          </div>
        </section>

        {/* Silver & Equipment */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Silver Remaining</h3>
            <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
              {silverRemaining} SP
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Equipment</h3>
            <ul className="list-disc list-inside">
              {equipmentList.length ? (
                equipmentList.map((i, j) => <li key={j}>{i}</li>)
              ) : (
                <li>No equipment selected</li>
              )}
            </ul>
          </div>
        </section>

        {/* Page 2: Skills — full-width, auto-fit grid */}
        <section className="p-6 mb-6">
          <div className="space-y-8">
            {/* Standard Skills */}
            <div>
              <h3 className="font-semibold mb-2">Standard Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {standardDisplayed.map(n => (
                  <div
                    key={n}
                    className="flex items-center p-2 border rounded min-w-0"
                  >
                    <span className="flex-1 font-medium break-words">{n}</span>
                    <span className="flex-none ml-2">
                      {character.skills?.[n] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resistances */}
{resistancesDisplayed.length > 0 && (
  <div>
    <h3 className="font-semibold mb-2">Resistances</h3>
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {resistancesDisplayed.map(n => (
        <div
          key={n}
          className="flex items-center p-2 border rounded min-w-0"
        >
          <span className="flex-1 font-medium break-words">{n}</span>
          <span className="flex-none ml-2">
            {character.skills?.[n] || 0}%
          </span>
        </div>
      ))}
    </div>
  </div>
)}

            {/* Combat Skills */}
            <div>
              <h3 className="font-semibold mb-2">Combat Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {combatDisplayed.length > 0 ? (
                  combatDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None learned</p>
                )}
              </div>
            </div>

            {/* Professional Skills */}
            <div>
              <h3 className="font-semibold mb-2">Professional Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {professionalDisplayed.length > 0 ? (
                  professionalDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None learned</p>
                )}
              </div>
            </div>

            {/* Magic Skills */}
            {magicDisplayed.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Magic Skills</h3>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                >
                  {magicDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </StepWrapper>
  );
}

// Styles for @react-pdf document
const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, fontFamily: 'Helvetica' },
  header: { fontSize: 16, marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' },
  section: { marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  label: { width: '25%', fontWeight: 'bold' },
  value: { width: '25%' },
  halfSection: { width: '50%' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  skillItem: { width: '33%', flexDirection: 'row', marginBottom: 2 },
});

// PDF Document Component
const CharacterSheetDocument = ({ character }) => {
  // recompute data as above...
  // (you can copy the same logic from ReviewStep for resistances, skills, equipment, HP)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{character.characterName || 'Character Sheet'}</Text>

        {/* Concept & Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Player:</Text>
            <Text style={styles.value}>{character.playerName}</Text>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{character.age}</Text>
            <Text style={styles.label}>Sex:</Text>
            <Text style={styles.value}>{character.sex}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Species:</Text>
            <Text style={styles.value}>{character.species}</Text>
            <Text style={styles.label}>Career:</Text>
            <Text style={styles.value}>{character.career}</Text>
            <Text style={styles.label}>Culture:</Text>
            <Text style={styles.value}>{character.culture}</Text>
          </View>
        </View>

        {/* Characteristics */}
        <View style={styles.section}>
          <Text style={styles.label}>Characteristics:</Text>
          <View style={styles.row}>
            {['STR','CON','SIZ','DEX','INT','POW','CHA'].map(stat => (
              <Text key={stat} style={[styles.halfSection, { marginRight: 8 }]}>
                {stat}: {character[stat]}
              </Text>
            ))}
          </View>
        </View>

        {/* Attributes */}
        <View style={styles.section}>
          <Text style={styles.label}>Attributes:</Text>
          <View style={styles.row}>
            {[
              { label: 'AP', key: 'actionPoints' },
              { label: 'DM', key: 'damageMod' },
              { label: 'XP Mod', key: 'xpMod' },
              { label: 'Heal', key: 'healingRate' },
              { label: 'Init', key: 'initiativeBonus' },
              { label: 'Luck', key: 'luckPoints' },
              { label: 'Move', key: 'movementRate' },
            ].map(({ label, key }) => (
              <Text key={key} style={[styles.halfSection, { marginRight: 8 }]}>
                {label}: {character[key]}
              </Text>
            ))}
          </View>
        </View>

        {/* HP per Location */}
        <View style={styles.section}>
          <Text style={styles.label}>HP per Location:</Text>
          <View style={styles.row}>
            {[
              ['Head','Head'],
              ['Chest','Chest'],
              ['Abdomen','Abdomen'],
              ['Each Arm','Left Arm'],
              ['Each Arm','Right Arm'],
              ['Leg','Left Leg'],
              ['Leg','Right Leg'],
            ].map(([k,label]) => (
              <Text key={label} style={[styles.halfSection, { marginRight: 8 }]}>
                {label}: {getHp(k)}
              </Text>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.label}>Silver Remaining:</Text>
          <Text style={styles.value}>{silverRemaining} SP</Text>
          {equipmentList.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 4 }]}>Equipment:</Text>
              {equipmentList.map((item,i) => (
                <Text key={i} style={styles.value}>• {item}</Text>
              ))}
            </>
          )}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.label}>Skills:</Text>
          <View style={styles.skillsGrid}>
            {standardDisplayed.map(n => (
              <View key={n} style={styles.skillItem}>
                <Text style={{ width: '70%' }}>{n}</Text>
                <Text style={{ width: '30%' }}>{character.skills?.[n]}%</Text>
              </View>
            ))}
            {resistancesDisplayed.map(n => (
              <View key={n} style={styles.skillItem}>
                <Text style={{ width: '70%' }}>{n}</Text>
                <Text style={{ width: '30%' }}>{character.skills?.[n]}%</Text>
              </View>
            ))}
            {combatDisplayed.map(n => (
              <View key={n} style={styles.skillItem}>
                <Text style={{ width: '70%' }}>{n}</Text>
                <Text style={{ width: '30%' }}>{character.skills?.[n]}%</Text>
              </View>
            ))}
            {professionalDisplayed.map(n => (
              <View key={n} style={styles.skillItem}>
                <Text style={{ width: '70%' }}>{n}</Text>
                <Text style={{ width: '30%' }}>{character.skills?.[n]}%</Text>
              </View>
            ))}
            {magicDisplayed.map(n => (
              <View key={n} style={styles.skillItem}>
                <Text style={{ width: '70%' }}>{n}</Text>
                <Text style={{ width: '30%' }}>{character.skills?.[n]}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Background & Contacts */}
        <View style={styles.section}>
          <Text style={styles.label}>Background:</Text>
          <Text style={styles.value}>{character.backgroundNotes}</Text>
          <Text style={[styles.label, { marginTop: 4 }]}>Contacts:</Text>
          <Text style={styles.value}>{character.contacts}</Text>
        </View>
      </Page>
    </Document>
  );
};
