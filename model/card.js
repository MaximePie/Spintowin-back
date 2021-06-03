const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  question: {type: String},
  answer: {type: String, required: true},
  currentDelay: {type: Number, default: 0},
  nextQuestionAt: {type: Date},
  image: {
    data: Buffer,
    contentType: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
