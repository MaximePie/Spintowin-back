import mongoose from 'mongoose'

import Card from "./Card/card.js"
import Category from "./category.js"

const userCardSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  currentDelay: {type: Number, default: 0},
  currentSuccessfulAnswerStreak: {type: Number, default: 0},
  nextQuestionAt: {type: Date},
  isMemorized: {type: Boolean, default: false},
});

/**
 *
 * Re-assemble the cards info to display it on screen
 *
 * @param user The user asking for a formatted Card
 * @return The formatted card ready to be displayed on screen
 */
userCardSchema.methods.formatted = async function (user) {
  const card = await Card.findById(this.cardId);
  const category = await Category.findById(this.categoryId);
  return {
    ...this._doc,
    isOwnerOfCard: user._id.toString() === card.user.toString(),
    answer: card.answer,
    question: card.question || null,
    image: card.image.data ? card.image : null,
    category: category?.title
  }
}

const UserCard = mongoose.model('userCard', userCardSchema);

export default UserCard;
