// src/utils/dice.js
export function rollDice(expr) {
  // e.g. "4d6*50" or "1d100"
  const [dicePart, multPart] = expr.split('*').map(s => s.trim());
  const [count, sides] = dicePart.split('d').map(Number);
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  if (multPart) total = Math.round(total * Number(multPart));
  return total;
}
