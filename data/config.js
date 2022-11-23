export function requiredExpForNextLevel(currentLevel) {
  return (500 * Math.pow(currentLevel, 2)) - (500 * currentLevel)
}

export const displayedCardsLimit = 300;
