const mongoose = require('mongoose');
const moment = require('moment');
const {Schema} = mongoose;
const Card = require('./card');
const UserCard = require('./userCard');
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
  lastActivity: {type: Date},
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

userSchema.methods.calculateProgressData = async function () {
  const cards = Card.find({user: this._id});
  const UserCard = Card.find({userId: this._id});

  return {
    total: await cards.count(),
    today: await UserCard.count({}),
    started: await cards.countDocuments({
      currentDelay: {$gt: 0}
    }),
  };
}

userSchema.methods.checkLastActivity = async function () {
  const todayDate = moment();
  const lastDay = moment(this.lastActivity);
  if(!todayDate.isSame(lastDay, "d")) {
    this.lastActivity = moment().toDate();
    this.save();
    UserCard.deleteMany({userId: this._id});
  }
}

userSchema.methods.updateProgress = async function(card) {
  // Si la carte est déjà dans la liste, ne pas l'ajouter, mais vider ses champs et ajouter le bon
  const startedInterval = intervals[0];
  const minuteInterval = intervals[5];
  const hourInterval = intervals[13];
  const dayInterval = intervals[17];
  const weekInterval = intervals[21];
  const monthInterval = intervals[24];

  const existingUserCard = await UserCard.findOne({cardId: card._id});
  let interval = "";

  switch(card.currentDelay) {
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

  if (existingUserCard) {
    existingUserCard.updateInterval(interval);
  }
  else {
    UserCard.createUserCard(this._id, card._id, interval);
  }

  this.save();
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

  const UserCards = UserCard.find({
    userId: this._id
  });

  const results = {
    total: await Cards.count(),
    moreThanOneMinute: await Cards.countDocuments({currentDelay: {$gte: minuteLength}}),
    moreThanOneHour: await Cards.countDocuments({currentDelay: {$gte: hourLength}}),
    moreThanOneDay: await Cards.countDocuments({currentDelay: {$gte: dayLength}}),
    moreThanOneWeek: await Cards.countDocuments({currentDelay: {$gte: weekLength}}),
    moreThanOneMonth: await Cards.countDocuments({currentDelay: {$gte: monthLength}}),
    startedCards: await UserCards.count(),
    todayMinuteLengthCard: await UserCards.count({ isMinuteLengthCard: true}),
    todayHourLengthCard: await UserCards.count({ isHourLengthCard: true}),
    todayDayLengthCard: await UserCards.count({ isDayLengthCard: true}),
    todayWeekLengthCard: await UserCards.count({ isWeekLengthCard: true}),
    todayMonthLengthCard: await UserCards.count({ isMonthLengthCard: true}),
    userId: this._id,
  };

  return results
};


const User = mongoose.model('User', userSchema);

module.exports = User;
