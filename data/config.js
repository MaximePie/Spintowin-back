module.exports.requiredExpForNextLevel = function (currentLevel) {
  return (500 * Math.pow(currentLevel, 2)) - (500 * currentLevel)
}

module.exports.displayedCardsLimit = 5;
