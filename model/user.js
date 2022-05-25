
const mongoose = require('mongoose');
const moment = require('moment');
const {Schema} = mongoose;
const Card = require('./card');
const UserBadge = require('./userBadge');
const Badge = require('./badge');
const UserCardStat = require('./userCardStat');
const {requiredExpForNextLevel} = require('../data/config');
const {startedInterval, minuteInterval, hourInterval, dayInterval, weekInterval, monthInterval} = require('../data/cards');
const UserCard = require("./userCard");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 2,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  hasAdsEnabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  password: {
    type: String,
    required: true,
    max: 255,
    min: 6
  },
  experience: {
    type: Number,
    default: 0,
  },
  experienceRequiredForNextLevel: {
    type: Number,
    default: 1000,
  },
  level: {
    type: Number,
    default: 0,
  },
  cards: [ // Used for foreign key purpose
    {type: Schema.Types.ObjectId, ref: 'Card'}
  ],
  lastActivity: {type: Date},

  // Has categories displayed
  hasCategoriesDisplayed: {type: Boolean, default: true}
});


userSchema.methods = {
  checkAchievements: async function () {

    const check =  async (badgeType) => {
      const userId = this._id;
      const testedValue = await this.currentProgressForBadge(badgeType, userId);
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

    const descernedBadges = [
      ...await check("addedCards"),
      ...await check("memorizedCardsMoreThanOneDay"),
      ...await check("memorizedCardsMoreThanOneWeek"),
      ...await check("memorizedCardsMoreThanOneMonth"),
    ];
    return descernedBadges;
  },

  updateProgress: async function (userCard) {
    // Si la carte est déjà dans la liste, ne pas l'ajouter, mais vider ses champs et ajouter le bon

    const existingUserCard = await UserCardStat.findOne({cardId: userCard.cardId});
    let interval = "";

    switch (userCard.currentDelay) {
      case monthInterval:
        interval = "month";
        break;
      case weekInterval:
        interval = "week";
        break;
      case dayInterval:
        interval = "day";
        break;
      case hourInterval:
        interval = "hour";
        break;
      case minuteInterval:
        interval = "minute";
        break;
      case startedInterval:
        interval = "started";
        break;
    }
    if (existingUserCard && interval) {
      await existingUserCard.updateInterval(interval);
    } else {
      await UserCardStat.createUserCardStat(this._id, userCard.cardId, interval);
    }

    await this.save();
  }
};

// assign a function to the "methods" object of our userSchema
userSchema.methods.updateExperience = function (card, callBack = null) {
  const earnedExperience = Math.round(card.currentDelay / 100);
  this.experience += earnedExperience > 1 ? earnedExperience : 1;
  if (this.experience >= this.experienceRequiredForNextLevel) {
    this.gainLevel();
  }
  return this.save();
};

userSchema.methods.gainLevel = function () {
  let experienceRequired = this.experienceRequiredForNextLevel;
  let remainingExperience = this.experience;
  let level = this.level;

  while (remainingExperience > experienceRequired) {
    remainingExperience -= experienceRequired;
    level++;
    experienceRequired = requiredExpForNextLevel(level);
  }

  this.experience = remainingExperience;
  this.level = level;
  this.experienceRequiredForNextLevel = experienceRequired;
};

userSchema.methods.currentProgressForBadge = async (badgeType, userId) => {
  // L'user se met à jour
  let currentValue = 0;
  switch (badgeType) {
    case "addedCards":
      currentValue = await Card.countDocuments({user: userId});
      break;
    case "memorizedCardsMoreThanOneDay":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: {$gte: dayInterval},
      });
      break;
    case "memorizedCardsMoreThanOneWeek":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: {$gte: weekInterval},
      });
      break;
    case "memorizedCardsMoreThanOneMonth":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: {$gte: monthInterval},
      });
      break;
    default:
      currentValue = 0;
      break;
  }
  return currentValue;
};

userSchema.methods.badges = async function badges() {
  const userId = this._id;
  const userBadges = await UserBadge.find({userId}).then(async userBadges => {
    // On renvoie le résultat de la promesse
    const badges = await Badge.find({_id: {$in: userBadges.map(({badgeId}) => badgeId)}});

    // Calculating top badges in each category
      const addedCardsBadge = UserBadge.topBadgeFromCategory(badges, "addedCards");
      const oneDayCardsBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneDay");
      const oneWeekCardBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneWeek");
      const oneMonthCardBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneMonth");
      const filteredBadges = [
        addedCardsBadge,
        oneDayCardsBadge,
        oneWeekCardBadge,
        oneMonthCardBadge
      ].filter(badge => badge !== undefined);

    const formatedBadges = Promise.all(filteredBadges.map(async badge => {
      if (badge) {
        const current = await this.currentProgressForBadge(badge.requiredField, userId);
        const requiredForNextBadge = await UserBadge.requiredProgressForNextBadge(badge);
        return {
          badge,
          current,
          required: requiredForNextBadge.requiredAmount,
        }
      }
    }));
    return formatedBadges;
  });
  return userBadges
};

userSchema.methods.calculateProgressData = async function () {
  const userId = this._id;
  const today = await Card
    .find({currentDelay: 5, user: userId})
    .then(async (cards) => {
      return UserCardStat.count({
        userId,
        cardId: {
          $in: cards.map(card => card._id)
        }
      })
    });

  return {
    total: await Card.count({user: this._id}),
    today,
    started: await Card.count({
      currentDelay: {$gt: 0}
    }),
  };
};
userSchema.methods.checkLastActivity = async function () {
  const todayDate = moment();
  const lastDay = moment(this.lastActivity);
  if (!this.lastActivity || !todayDate.isSame(lastDay, "d")) {
    await UserCardStat.deleteMany({userId: this._id});
    this.lastActivity = moment().toDate();
    this.save();
  }
};


userSchema.methods.calculateMemorizedData = async function () {
  const Cards = Card.find({
    user: this._id,
    currentDelay: {
      $gt: 0,
    }
  });
  const minuteLength = 54;
  const hourLength = 60 * 60;
  const dayLength = 24 * hourLength;
  const weekLength = 7 * dayLength;
  const monthLength = 30 * dayLength;

  const todayMinuteLengthCard = await UserCardStat.count({
    isMinuteLengthCard: true,
    userId: this._id,
  });
  const todayHourLengthCard = await UserCardStat.count({
    isHourLengthCard: true,
    userId: this._id,
  });
  const todayDayLengthCard = await UserCardStat.count({
    isDayLengthCard: true,
    userId: this._id,
  });
  const todayWeekLengthCard = await UserCardStat.count({
    todayWeekLengthCard: true,
    userId: this._id,
  });
  const todayMonthLengthCard = await UserCardStat.count({
    todayMonthLengthCard: true,
    userId: this._id,
  });

  const results = {
    total: await Cards.count(),
    moreThanOneMinute: await Cards.countDocuments({currentDelay: {$gte: minuteLength}}),
    moreThanOneHour: await Cards.countDocuments({currentDelay: {$gte: hourLength}}),
    moreThanOneDay: await Cards.countDocuments({currentDelay: {$gte: dayLength}}),
    moreThanOneWeek: await Cards.countDocuments({currentDelay: {$gte: weekLength}}),
    moreThanOneMonth: await Cards.countDocuments({currentDelay: {$gte: monthLength}}),
    startedCards: await UserCardStat.count(),
    todayMinuteLengthCard,
    todayHourLengthCard,
    todayDayLengthCard,
    todayWeekLengthCard,
    todayMonthLengthCard,
    userId: this._id,
  };

  return results
};


/**
 * Returns the reviewQuestions onGoing query for the User
 *
 * @param categories {array} of question Categories
 * @return {QueryWithHelpers<Array<Document<any, any>>, Document<any, any>, {}>}
 */
userSchema.methods.reviewQuestions = function (categories = []) {
  const currentDate = new Date();
  const query = {
    userId: this._id,
    nextQuestionAt: {
      $lt: currentDate.valueOf()
    },
    isMemorized: {
      $ne: true,
    }
  };

  if (categories.length) {
    query.categoryId = {
      $in: categories.map(category => mongoose.Types.ObjectId(category))
    }
  }

  return UserCard
    .find(query)
    .sort({
      currentDelay: 1,
      nextQuestionAt: -1,
    })
    .find()
};

userSchema.methods.remainingQuestionsCount = async function() {
  const currentDate = new Date();

  return UserCard.count({
    userId: this._id,
    nextQuestionAt: {
      $lt: currentDate.valueOf()
    },
    isMemorized: false,
  })
}



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
module.exports = User;
