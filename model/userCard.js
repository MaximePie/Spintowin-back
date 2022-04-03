const mongoose = require('mongoose');

const userCardSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  currentDelay: {type: Number, default: 0},
  currentSuccessfulAnswerStreak: {type: Number, default: 0},
  nextQuestionAt: {type: Date},
  isMemorized: {type: Boolean, default: false},
});

const UserCard = mongoose.model('userCard', userCardSchema);

module.exports = UserCard;
