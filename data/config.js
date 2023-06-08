export function requiredExpForNextLevel(currentLevel) {
  return (500 * Math.pow(currentLevel, 2)) - (500 * currentLevel)
}

// 50 is a weird and annoying behaviour of the app
export const DISPLAYED_CARD_LIMIT = 49;
