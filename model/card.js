const mongoose = require('mongoose');

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

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
