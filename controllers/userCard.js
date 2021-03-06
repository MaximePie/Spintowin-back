const UserCard = require('../model/userCard.js');
const Card = require('../model/card');
const User = require('../model/user');
const UserAnswer = require('../model/stats/userAnswer');
const {displayedCardsLimit} = require("../data/config");
const Category = require("../model/category");

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
module.exports.resorb = async function resorb(request, response) {
  const {userCardId} = request.params;
  const deletedCard = await UserCard.findById(userCardId);

  await UserCard.deleteOne({
    _id: userCardId
  });

  response.status(success).json(deletedCard);
};

/**
 * Absorb all the cards received in the body
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
module.exports.absorbMany = async function absorbMany(request, response) {
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
};

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
module.exports.absorb = async function absorb(request, response) {
  const user = request.user;
  const cardId = request.params.id;
  const userId = user._id;
  const createdUserCard = await absorbCard(cardId, userId);

  await response.status(201).json({
    userId,
    cardId,
    createdUserCard
  });
};

/**
 * Returns the first card in the review list
 * Route : /userCard/getOne
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
module.exports.reviewOne = async function reviewOne(request, response) {
  const user = await User.findById(request.user._id);

  const {categories} = request.body;

  const userCard = await user.reviewQuestions(categories).findOne();
  if (userCard) {
    // Merging properties
    const card = await userCard.formatted(user);
    const remainingCards = await user.remainingQuestionsCount();
    response.status(success).json({card, remainingCards,})
  }
  else {
    response.status(error.notFound).json({message: "La carte n'existe pas"});
  }
};

/**
 * Returs the displayedCardsLimit amount of cards to the user.
 * Route : /userCards
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
module.exports.train = async function train(request, response) {
  /**
   * @type {User}
   */
  const user = await User.findById(request.user._id);
  if (!user) {
    throw new Error("User not found");
  }

  const reviewCards = await user.reviewQuestions().limit(displayedCardsLimit);

  // Merging properties
  const cards = await Promise.all(reviewCards.map(async (reviewCard) => reviewCard.formatted(user)));

  response.status(success).json({
    cards,
    remainingCards: await user.remainingQuestionsCount(),
  })
};

/**
 * Update the UserCard
 *  update delay according to answer state
 *  update nextQuestionAt field
 *   True : Increase
 *   False : Reset
 *
 * Update the User
 *  UpdateCardForUser
 *
 * @param request
 * @param response
 * @return {Promise<void>}
 */
module.exports.updateV2 = async function update (request, response) {

};


/**
 * Route : '/cards/:id'
 * Called when the user has answered, so we can update the card data
 * @param request
 * @param response
 * @returns {Promise<any>}
 */
module.exports.update = async function update(request, response) {

  const {newDelay, isMemorized, answerTime: answerDelay, isFromReviewPage} = request.body;
  if (!newDelay && newDelay !== 0) {
    response.status(400).json({message: 'Erreur, il manque le newDelay'});
    return;
  }


  const {id: cardId} = request.params;
  if (!cardId) {
    throw Error("Card ID has to be defined");
  }
  const userId = request.user._id;
  const card = await UserCard.findOne({cardId, userId});

  const nextQuestionAt = new Date();
  nextQuestionAt.setSeconds(nextQuestionAt.getSeconds() + newDelay);

  const wasLastAnswerSuccessful = newDelay > card.currentDelay;
  if (wasLastAnswerSuccessful) {
    card.currentSuccessfulAnswerStreak++;
    User.UpdateCardForUser(request.user._id, card);
  } else {
    card.currentSuccessfulAnswerStreak = 0;
  }
  UserAnswer.createNew(card.currentDelay, userId, wasLastAnswerSuccessful, isFromReviewPage && answerDelay);

  card.currentDelay = newDelay;
  card.nextQuestionAt = nextQuestionAt.valueOf();

  if (isMemorized) {
    card.isMemorized = true;
  }

  await card.save();
  return response.json({message: "OK"});
};


/**
 * Route /userCards/list/:_id
 * Sends back the complete list of cards assigned to a user
 * @param request params._id The _id of the user
 * @param response
 * @returns {Promise<void>}
 */
module.exports.list = async function list(request, response) {

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
};

module.exports.transfert = async function transfert(request, response) {
  await UserCard.deleteMany({});
  let createdCards = 0;
  const userCardsToBeTransfered = await Card.find({
    user: request.params._id,
  });

  userCardsToBeTransfered.map(async (card) => {
    const createdCard = await UserCard.create({
      userId: request.params._id,
      cardId: card._id,
      currentDelay: card.currentDelay,
      currentSuccessfulAnswerStreak: card.currentSuccessfulAnswerStreak,
      nextQuestionAt: card.nextQuestionAt,
    });
    createdCards++;
  });
  await response.json({userCardsToBeTransfered});
};

/**
 * Attaches a category to a userCard
 * Route : /userCards/categories/add/:_id
 * @param request
 * @param response
 * @return {Promise<void>}
 */
module.exports.addCategory = async function (request, response) {
  const {_id} = request.params;
  const {categoryIdentifier} = request.body;

  const userCard = await UserCard.findById(_id);
  if (userCard) {
    const category = await Category.findOne({title: categoryIdentifier});
    if (category) {
      userCard.categoryId = category._id;
      response.json({
        code: success,
      })
    }
    else {
      response.json({
        message: "Category not found",
        code: 500,
      })
    }
  }
  else {
    response.json({message: "User card not found", code: 500})
  }
};