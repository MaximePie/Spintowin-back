const mongoose = require('mongoose');
const {intervals} = require("../data/cards");

const cardSchema = mongoose.Schema({
  question: {type: String},
  answer: {type: String, required: true},
  image: {
    data: Buffer,
    contentType: String,
  },
  currentDelay: {type: Number, default: 0},
  currentSuccessfulAnswerStreak: {type: Number, default: 0},
  nextQuestionAt: {type: Date},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});


/**
 * Increase the delay of the user Card
 * Updates the Next question at
 *
 */
cardSchema.methods.increaseDelay = function () {
  const currentDelayIndex = intervals.indexOf(this.currentDelay);
  this.currentDelay = intervals[currentDelayIndex + 1];
  if (this.experience >= this.experienceRequiredForNextLevel) {
    this.gainLevel();
  }
  return this.save();
};


const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
