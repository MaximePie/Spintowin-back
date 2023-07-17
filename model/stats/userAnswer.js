import mongoose from 'mongoose';

/**
 * This is used only for experimental purpose!
 * It tracks the time taken by a user to answer to a specific delay,
 * to eventually point out which delays are useless, or relevant
 */
const userAnswerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cardDelay: {type: Number, default: 0},
    isSuccessful: {type: Boolean, default: false},
    answerDelay: {type: Number, defalut: 5000},
    createdAt: {type: Date, default: Date.now},
});

/**
 * Create a new UserWrongAnswer based on the given parameters
 * @param delay {number} The delay of the card the user has failed to answer
 * @param userId - The ID of the user that missed the target
 * @param isSuccessful {boolean} If the answer has been successfuly answered
 * @param answerDelay {number} The amount in MS taken by user to answer
 * @async
 * @returns {Promise<void>}
 */
userAnswerSchema.statics.createNew = async function createNew(
  delay,
  userId,
  isSuccessful,
  answerDelay
) {
    const answer = new UserAnswer({cardDelay: delay, userId, isSuccessful, answerDelay});
    await answer.save();
    return answer;
};


const UserAnswer = mongoose.model('UserAnswer', userAnswerSchema);

export default UserAnswer;
