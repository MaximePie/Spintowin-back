const mongoose = require('mongoose');
const moment = require('moment');
const {Schema} = mongoose;
const Card = require('./card');
const UserBadge = require('./userBadge');
const UserCard = require('./userCard');
const {requiredExpForNextLevel} = require('../data/levels');
const {startedInterval, minuteInterval, hourInterval, dayInterval, weekInterval, monthInterval} = require('../data/cards');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
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
});


userSchema.methods = {
  checkAchievements: async function () {
    const descernedBadges = [
      ...await UserBadge.check(this._id, "addedCards"),
      ...await UserBadge.check(this._id, "memorizedCardsMoreThanOneDay"),
      ...await UserBadge.check(this._id, "memorizedCardsMoreThanOneWeek"),
      ...await UserBadge.check(this._id, "memorizedCardsMoreThanOneMonth"),
    ];

    return descernedBadges;
  },

  updateProgress: async function (card) {
    // Si la carte est déjà dans la liste, ne pas l'ajouter, mais vider ses champs et ajouter le bon

    const existingUserCard = await UserCard.findOne({cardId: card._id});
    let interval = "";

    switch (card.currentDelay) {
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
      await UserCard.createUserCard(this._id, card._id, interval);
    }

    await this.save();
  }
}

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

userSchema.methods.calculateProgressData = async function () {
  const userId = this._id;
  const today = await Card
    .find({currentDelay: 5, user: userId})
    .then(async (cards) => {
      return UserCard.count({
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
}

userSchema.methods.checkLastActivity = async function () {
  const todayDate = moment();
  const lastDay = moment(this.lastActivity);
  if (!this.lastActivity || !todayDate.isSame(lastDay, "d")) {
    await UserCard.deleteMany({userId: this._id});
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

  const UserCards = UserCard.find({
    userId: this._id
  });

  const todayMinuteLengthCard = await UserCard.count({
    isMinuteLengthCard: true,
    userId: this._id,
  });
  const todayHourLengthCard = await UserCard.count({
    isHourLengthCard: true,
    userId: this._id,
  });
  const todayDayLengthCard = await UserCard.count({
    isDayLengthCard: true,
    userId: this._id,
  });
  const todayWeekLengthCard = await UserCard.count({
    todayWeekLengthCard: true,
    userId: this._id,
  });
  const todayMonthLengthCard = await UserCard.count({
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
    startedCards: await UserCards.count(),
    todayMinuteLengthCard,
    todayHourLengthCard,
    todayDayLengthCard,
    todayWeekLengthCard,
    todayMonthLengthCard,
    userId: this._id,
  };

  return results
};


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
