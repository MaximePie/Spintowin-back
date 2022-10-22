import mongoose from 'mongoose'
import {intervals} from "../../data/cards.js"
import {onRemove} from "./hooks.js";

const cardSchema = mongoose.Schema({
  question: {type: String},
  answer: {type: String, required: true},
  image: String,
  currentDelay: {type: Number, default: 0},
  currentSuccessfulAnswerStreak: {type: Number, default: 0},
  nextQuestionAt: {type: Date},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hints: [
    {
      type: mongoose.Schema.Types.String,
    }
  ],
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

cardSchema.pre('remove', onRemove);


const Card = mongoose.model('Card', cardSchema);

export default Card;
