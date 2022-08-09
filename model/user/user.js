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
