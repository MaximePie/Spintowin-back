import mongoose from 'mongoose'
import Badge from './badge.js'

const userBadgeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  }
});


userBadgeSchema.statics = {

  topBadgeFromCategory: (badges, badgeType) => {
    return badges
      .filter(badge => badge.requiredField === badgeType)
      .sort((firstBadge, secondBadge) => secondBadge.level - firstBadge.level)[0];
  },

  requiredProgressForNextBadge: async (badge) => {
    return Badge.findOne({requiredAmount: {$gt: badge.requiredAmount}}).sort({requiredAmount: 1});
  },
};

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

export default UserBadge;
