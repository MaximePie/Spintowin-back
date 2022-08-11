import {
  calculateMemorizedData,
  calculateProgressData,
  remainingQuestionsCount,
  checkAchievements,
  checkLastActivity,
  badges,
  gainLevel,
  initializeIntervals,
  updateExperience,
  updateProgress,
  currentProgressForBadge,
  reviewQuestions,
} from "./methods.js";
import {schema} from "./schema.js";

import mongoose from 'mongoose';
import UserCard from "../userCard.js";

const userSchema = mongoose.Schema(schema);
userSchema.methods = {
  calculateMemorizedData,
  calculateProgressData,
  remainingQuestionsCount,
  checkAchievements,
  checkLastActivity,
  badges,
  gainLevel,
  initializeIntervals,
  updateExperience,
  updateProgress,
  currentProgressForBadge,
  reviewQuestions,
};


userSchema.statics.UpdateCardForUser = async function (userId, card) {
  const user = await User.findById(userId);
  await user.updateExperience(card);
  user.updateProgress(card);
}

userSchema.post('findOneAndUpdate', function (next) {
  // ...
  const intervals = this._update['$set'].intervals;
  if (intervals) { // If intervals changed
    const possibleIntervals = intervals.filter(({isEnabled}) => isEnabled).map(({value}) => value);

    // Update all the UserCards
    const userCards = UserCard.find({userId: this._id});

    userCards.forEach(userCard => {
      const closestSuperiorDelay = possibleIntervals
        .find((element, index) => {
            return (
              card.currentDelay <= possibleIntervals[index]
              && card.currentDelay > (possibleIntervals[index - 1] || 0)
            )
          }
        );
    })
  }
});

const User = mongoose.model('User', userSchema);


const userEventEmitter = User.watch();

userEventEmitter.on('change', async change => {
  const _id = change.documentKey._id;
  User.findById(_id).then((user) => {
    if (user) {
      user.checkLastActivity();
      user.checkAchievements();
    }
  });
});
export default User;
