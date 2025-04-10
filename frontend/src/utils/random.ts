/**
 * Generate random index in given range
 */
export const randomIndex = (length: number): number => {
  return Math.floor(Math.random() * length);
};

/**
 * Select an item from an array with probability weighted by score
 * @param items - Array of items with scores
 * @returns The selected item
 */
export function weightedRandomSelection<T>(
  items: Array<{ node: T; score: number }>
): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }

  if (items.length === 1) {
    return items[0].node;
  }

  // Calculate total score
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);

  // Random selection weighted by score
  const randomValue = Math.random() * totalScore;
  let cumulativeScore = 0;

  for (const item of items) {
    cumulativeScore += item.score;
    if (randomValue <= cumulativeScore) {
      return item.node;
    }
  }

  // Fallback (should rarely happen)
  return items[0].node;
}
