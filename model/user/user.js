import {
  badges,
  calculateMemorizedData,
  calculateProgressData,
  checkAchievements,
  checkLastActivity,
  currentProgressForBadge,
  gainLevel,
  initializeIntervals, notStartedQuestionsCount,
  remainingQuestionsCount,
  reviewQuestions,
  updateExperience, updateIntervals,
  updateProgress,
  updateCard,
} from "./methods.js";
import {schema} from "./schema.js";

import mongoose from 'mongoose';
import UserCard from "../userCard.js";

const userSchema = mongoose.Schema(schema);
userSchema.methods = {
  calculateMemorizedData,
  calculateProgressData,
  remainingQuestionsCount,
  notStartedQuestionsCount,
  checkAchievements,
  checkLastActivity,
  badges,
  gainLevel,
  initializeIntervals,
  updateExperience,
  updateProgress,
  currentProgressForBadge,
  updateIntervals,
  reviewQuestions,
  updateCard,
};


userSchema.pre('save', async function (next) {
  // ...
  if (this.modifiedPaths().includes('intervals')) { // If intervals changed
    const possibleIntervals = this.intervals.filter(({isEnabled}) => isEnabled).map(({value}) => value);
    // Update all the UserCards
    const userCards = await UserCard.find({userId: this._id});

    userCards.forEach(userCard => {
      userCard.currentDelay = possibleIntervals
        .find((element, index) => {
            return (
              userCard.currentDelay <= possibleIntervals[index]
              && userCard.currentDelay > (possibleIntervals[index - 1] || 0)
            )
          }
        );
      userCard.save();
    });
    return next();
  }
  return next();
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
