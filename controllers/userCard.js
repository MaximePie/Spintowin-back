import UserCard from '../model/userCard.js'
import Card from '../model/Card/card.js'
import User from '../model/user/user.js'
import UserAnswer from '../model/stats/userAnswer.js'
import {displayedCardsLimit} from "../data/config.js"

const success = 200;
const error = {
  notFound: 404
};

/**
 * Route : "/userCards/resorb/:userCardId"
 * Remove the userCard receveived as a parameter from the userCards collection
 * @param request
 * @param response
 * @returns The name of the deleted Card
 */
async function resorb(request, response) {
  const {userCardId} = request.params;
  const deletedCard = await UserCard.findById(userCardId);

  await UserCard.deleteOne({
    _id: userCardId
  });

  response.status(success).json(deletedCard);
}

/**
 * Absorb all the cards received in the body
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
async function absorbMany(request, response) {
  const user = request.user;
  const userId = user._id;
  const {cardsIds} = request.body;
  const newUserCards = [];
  cardsIds.map(async (cardId) => {
    newUserCards.push(await absorbCard(cardId, userId));
  });

  return response.json({
    cardsIds,
    user: userId,
    newUserCards
  });
}

/**
 * Absorbs the card received as a parameter and adds
 * it to the current user cards collection
 * @param cardId
 * @param userId
 */
async function absorbCard(cardId, userId) {
  const newDate = new Date();

  const createdUserCard = await UserCard.create({
    userId,
    cardId,
    delay: 0,
    nextQuestionAt: newDate.valueOf(),
  });

}

/**
 * Route : "/userCards/absorb/:_id"
 * Absorbs one card represented by the received _id as a parameter
 * @param request
 * @param response
 * @returns the created userCard
 */
async function absorb(request, response) {
  const user = request.user;
  const cardId = request.params.id;
  const userId = user._id;
  const createdUserCard = await absorbCard(cardId, userId);

  await response.status(201).json({
    userId,
    cardId,
    createdUserCard
  });
}

/**
 * Returns the first card in the review list
 * Route : /userCard/getOne
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
async function reviewOne(request, response) {
  const user = await User.findById(request.user._id);

  const {categories} = request.body;

  const userCards = await user.reviewQuestions(categories);
  if (userCards?.length) {
    const userCard = userCards[0];
    const {cardId: card, userId} = userCard;
    // Merging properties
    const result = {
      ...userCard._doc,
      cardId: card._id,
      isOwnerOfCard: request.user._id.toString() === userId.toString(),
      answer: card.answer,
      question: card.question || null,
      image: card.image || null,
      category: card.categoryId?.title
    };
    const remainingCards = await user.remainingQuestionsCount();
    response.status(success).json({card: result, remainingCards})
  } else {
    response.status(error.notFound).json({message: "La carte n'existe pas"});
  }
}

/**
 * Returs the displayedCardsLimit amount of cards to the user.
 *
 * Priority (to save bandwidth):
 * 1 - Cards without image
 * 2 - Cards with images, but only 3 at the same time
 *
 * Route : /userCards
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
async function train(request, response) {
  /**
   * @type {User}
   */

  const user = await User.findById(request.user._id);
  if (!user) {
    throw new Error("User not found");
  }
  const reviewCards = await user.reviewQuestions();

  // Merging properties
  const cardsList = reviewCards.map(userCard => {
    const {cardId: card, categoryId: category} = userCard;
    return {
      ...userCard._doc,
      cardId: card._id,
      isOwnerOfCard: user._id.toString() === userCard.userId.toString(),
      answer: card.answer,
      question: card.question || null,
      image: card.image || null,
      category: category?.title,
      hints: card.hints || null,
    }
  });

  const cardsWithImage = cardsList.filter(({image}) => !!image);

  response.status(success).json({
    cards: cardsList,
    // cards: returnedCards,
    cardsWithImage,
    remainingCards: await user.remainingQuestionsCount(),
  })
}


/**
 * Route : '/cards/:id'
 * Called when the user has answered, so we can update the card data
 * @param request
 * @param response
 * @returns {Promise<any>}
 */
async function update(request, response) {

  const {isMemorized, answerTime: answerDelay, isFromReviewPage, isSuccessful} = request.body;

  const {id} = request.params;
  if (!id) {
    throw Error("Card ID has to be defined");
  }
  const userId = request.user._id;
  const user = await User.findById(userId);
  const card = await UserCard.findById(id);
  console.log(card);
  console.log(id);

  if (isSuccessful === undefined) {
    // Invalid parameters status code
    return response.status(400).json({message: "Invalid parameters, isSuccessful is missing, check the spelling", });
  }

  if (!card) {
    return response.status(404).json({message: "Card not found"});
  }

  if (card.userId.toString() !== userId.toString()) {
    return response.status(403).json({message: "You are not allowed to update this card"});
  }

  const nextQuestionAt = new Date();
  if (isSuccessful) {
    card.currentSuccessfulAnswerStreak++;
    User.UpdateCardForUser(request.user._id, card);
  } else {
    card.currentSuccessfulAnswerStreak = 0;
  }
  UserAnswer.createNew(card.currentDelay, userId, isSuccessful, isFromReviewPage && answerDelay);

  // Get the next enabled user interval to the current card delay
  const enabledIntervals = user.intervals.filter(interval => interval.isEnabled);
  const newDelay = enabledIntervals[enabledIntervals.findIndex(interval => interval.value === card.currentDelay) + 1]?.value || card.currentDelay;
  nextQuestionAt.setSeconds(nextQuestionAt.getSeconds() + newDelay);
  card.currentDelay = newDelay;
  card.nextQuestionAt = nextQuestionAt.valueOf();

  if (isMemorized) {
    card.isMemorized = true;
  }

  console.log(card);
  console.log(newDelay);
  console.log(nextQuestionAt.valueOf());

  await card.save();
  return response.json({message: "OK", newDelay, card});
}


/**
 * Route /userCards/list/:_id
 * Sends back the complete list of cards assigned to a user
 * @param request params._id The _id of the user
 * @param response
 * @returns {Promise<void>}
 */
async function list(request, response) {

  const userCards = await UserCard.find({userId: request.params._id})
    .select('cardId -_id');
  const cardIds = userCards.map(card => card.cardId);
  const cards = await Card.find({'_id': {$in: cardIds}})
    .sort({answer: 1});

  const connectedUserId = request.user._id;
  const connectedUserCards = await UserCard.find({userId: connectedUserId}, {"cardId": 1, "_id": 0});
  const connectedUserCardsIds = connectedUserCards.map(connectedUserCard => connectedUserCard.cardId.toString());
  const formatedCards = cards.map(card => {
      return {
        ...card._doc,
        isAssignedToConnectedUser: connectedUserCardsIds.includes(card._id.toString()),
      }
    }
  );

  await response.json({cards: formatedCards,})
}

async function transfert(request, response) {
  await UserCard.deleteMany({});
  let createdCards = 0;
  const userCardsToBeTransfered = await Card.find({
    user: request.params._id,
  });

  userCardsToBeTransfered.map(async (card) => {
    const createdCard = await UserCard.create({
      userId: request.params._id,
      cardId: card._id,
      currentDelay: 0,
      currentSuccessfulAnswerStreak: card.currentSuccessfulAnswerStreak,
      nextQuestionAt: Date.now(),
    });
    createdCards++;
  });
  await response.json({userCardsToBeTransfered});
}

const userController = {
  absorb,
  absorbMany,
  reviewOne,
  train,
  update,
  list,
  transfert,
  resorb,
};

export default userController