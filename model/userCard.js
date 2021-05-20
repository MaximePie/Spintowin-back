const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * Cette table est censée se vider tous les jours.
 *
 */
const userCardSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  isMinuteLengthCard: {
    type: Boolean,
    default: false,
  },
  isHourLengthCard: {
    type: Boolean,
    default: false,
  },
  isDayLengthCard: {
    type: Boolean,
    default: false,
  },
  isWeekLengthCard: {
    type: Boolean,
    default: false,
  },
  isMonthLengthCard: {
    type: Boolean,
    default: false,
  },
});

userCardSchema.methods.updateInterval = (interval) => {
  this.isMinuteLengthCard = false;
  this.isHourLengthCard = false;
  this.isDayLengthCard = false;
  this.isWeekLengthCard = false;
  this.isMonthLengthCard = false;

  switch (interval) {
    case "month":
      this.isMonthLengthCard = true;
      break;
    case "week":
      this.isWeekLengthCard = true;
      break;
    case "day":
      this.isDayLengthCard = true;
      break;
    case "hour":
      this.isHourLengthCard = true;
      break;
    case "minute":
      this.isMinuteLengthCard = true;
      break;
  }
};

userCardSchema.statics.createUserCard = async function createUserCard(userId, cardId, interval) {
  const card = new UserCard();
  card.userId = userId;
  card.cardId = cardId;

  switch (interval) {
    case "month":
      card.isMonthLengthCard = true;
      break;
    case "week":
      card.isWeekLengthCard = true;
      break;
    case "day":
      card.isDayLengthCard = true;
      break;
    case "hour":
      card.isHourLengthCard = true;
      break;
    case "minute":
      card.isMinuteLengthCard = true;
      break;
  }

  await card.save();
}

const UserCard = mongoose.model('UserCard', userCardSchema);

module.exports = UserCard;
