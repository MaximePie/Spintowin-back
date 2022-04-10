const mongoose = require('mongoose');

/**
 * This is used only for experimental purpose!
 * Is used to track wrong answers data and eventually
 * adjust the interval later on.
 *
 * Example : When a user gives a wrong answer too many times
 * on the same interval, it might mean that the delay is too high.
 *
 */
const userWrongAnswerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cardDelay: {type: Number, default: 0},
});

/**
 * Create a new UserWrongAnswer based on the given parameters
 * @param delay {number} The delay of the card the user has failed to answer
 * @param userId - The ID of the user that missed the target
 * @async
 * @returns {Promise<void>}
 */
userWrongAnswerSchema.statics.create = async function create(delay, userId) {
    const wrongAnswer = new UserWrongAnswer({cardDelay: delay, userId});
    await wrongAnswer.save();
    return wrongAnswer;
}


const UserWrongAnswer = mongoose.model('UserWrongAnswer', userWrongAnswerSchema);

module.exports = UserWrongAnswer;
