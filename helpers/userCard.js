/**
 * Use this function to get the next delay for a card
 * @param enabledIntervals
 * @param currentDelayIndex
 * @param card
 * @param isSuccessful
 * @return {*}
 */
export const getNewDelay = (enabledIntervals, currentDelayIndex, card, isSuccessful) => {
    const nextDelay = enabledIntervals[currentDelayIndex + 1]?.value;
    const firstDelay = enabledIntervals[0]?.value;
    const previousDelay = enabledIntervals[currentDelayIndex - 1]?.value;
    if (true === isSuccessful) {
        return nextDelay;
    }
    if (false === isSuccessful) {
        return previousDelay || firstDelay;
    }
    console.log('isSuccessful is not a boolean, returning currentDelay')
    return card.currentDelay;
};