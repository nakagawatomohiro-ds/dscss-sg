/** Fisher-Yates shuffle returning shuffled array and the order mapping */
export function shuffleChoices(choices: string[]): {
  shuffledChoices: string[];
  choiceOrder: number[];  // choiceOrder[displayIndex] = originalIndex
} {
  const indices = choices.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    shuffledChoices: indices.map((oi) => choices[oi]),
    choiceOrder: indices,
  };
}

/** Given choiceOrder and original correct_index, find the display index of the correct answer */
export function getCorrectDisplayIndex(choiceOrder: number[], correctOriginalIndex: number): number {
  return choiceOrder.indexOf(correctOriginalIndex);
}
