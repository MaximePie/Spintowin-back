const mongoose = require('mongoose');
const Card = require('./card');
const Badge = require('./badge');
const {dayInterval, weekInterval, monthInterval} = require('../data/cards');

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

  check: async (userId, badgeType) => {

    const user = await User.findById(userId);
    const testedValue = user.currentProgressForBadge(badgeType);

    const availableBadges = await Badge.find({
      requiredField: badgeType,
      requiredAmount: {
        $lte: testedValue,
      }
    });

    const availableBadgesIds = availableBadges.map(badge => badge._id);
    const descernedBadgesForUser = await UserBadge.count({userId, badgeId: {$in: availableBadges}});

    if (descernedBadgesForUser !== availableBadgesIds.length) {
      const undescernedBadgesForUser = await Badge
        .find({
          requiredField: badgeType,
          requiredAmount: {
            $lte: testedValue,
          }
        })
        .then(async badges => {
          const undescerned = [];
          for (const badge of badges) {
            const {_id: badgeId} = badge;
            const isDescerned = await UserBadge.findOne({userId, badgeId});
            if (!isDescerned) {
              undescerned.push(badge);
            }
          }
          return undescerned;
        });

      undescernedBadgesForUser.forEach(badge => {
        UserBadge.create({
          userId,
          badgeId: badge._id,
        })
      });
      return undescernedBadgesForUser;
    }
    else {
      return [];
    }
  }
};

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = UserBadge;
