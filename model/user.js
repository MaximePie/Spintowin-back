const mongoose = require('mongoose');
const {Schema} = mongoose;
const Card = require('./card');
const {requiredExpForNextLevel} = require('../data/levels');
const {intervals} = require('../data/cards');

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
  startedCards: {
    type: Number,
    default: 0,
  },
  todayMinuteLengthCard: {
    type: Number,
    default: 0,
  },
  todayHourLengthCard: {
    type: Number,
    default: 0,
  },
  todayDayLengthCard: {
    type: Number,
    default: 0,
  },
  todayWeekLengthCard: {
    type: Number,
    default: 0,
  },
  todayMonthLengthCard: {
    type: Number,
    default: 0,
  },
});

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

userSchema.methods.calculateMemorizedData  = async function () {

  const Cards = Card.find({
    user: this._id,
  });
  const minuteLength = 54;
  const hourLength = 60 * 60;
  const dayLength = 24 * hourLength;
  const weekLength = 7 * dayLength;
  const monthLength = 30 * dayLength;

  const results = {
    total: await Cards.count(),
    moreThanOneMinute: await Cards.countDocuments({currentDelay: {$gte: minuteLength}}),
    moreThanOneHour: await Cards.countDocuments({currentDelay: {$gte: hourLength}}),
    moreThanOneDay: await Cards.countDocuments({currentDelay: {$gte: dayLength}}),
    moreThanOneWeek: await Cards.countDocuments({currentDelay: {$gte: weekLength}}),
    moreThanOneMonth: await Cards.countDocuments({currentDelay: {$gte: monthLength}}),
    startedCards: this.startedCards,
    todayMinuteLengthCard: this.todayMinuteLengthCard,
    todayHourLengthCard: this.todayHourLengthCard,
    todayDayLengthCard: this.todayDayLengthCard,
    todayWeekLengthCard: this.todayWeekLengthCard,
    todayMonthLengthCard: this.todayMonthLengthCard,
  };

  return results
}

userSchema.methods.calculateProgressData = async function () {
  const userCards = Card.find({user: this._id});

  return {
    total: await userCards.count(),
    today: this.startedCards,
    started: await userCards.countDocuments({
      currentDelay: {$gt: 0}
    }),
  };
}

userSchema.methods.updateProgress = async function(card) {
  const startedInterval = intervals[0];
  const minuteInterval = intervals[5];
  const hourInterval = intervals[13];
  const dayInterval = intervals[17];
  const weekInterval = intervals[21];
  const monthInterval = intervals[24];

  switch(card.currentDelay) {
    case monthInterval:
      this.todayMonthLengthCard++;
      break;
    case weekInterval:
      this.todayWeekLengthCard++;
      break;
    case dayInterval:
      this.todayDayLengthCard++;
      break;
    case hourInterval:
      this.todayHourLengthCard++;
      break;
    case minuteInterval:
      this.todayMinuteLengthCard++;
      break;
    case startedInterval:
      this.startedCards++;
  }

  this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
