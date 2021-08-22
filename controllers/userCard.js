const UserCard = require('../model/userCard.js');
const Card = require('../model/card');
const User = require('../model/user');
const {displayedCardsLimit} =  require("../data/config");

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
  console.log(userCardId);

  await UserCard.deleteOne({
    _id: userCardId
  });

  response.status(200).json(deletedCard);
};

/**
 * Route : "/userCards/absorb/:_id"
 * Absorbs the card received as a parameter and adds it to the current user cards collection
 * @param request
 * @param response
 * @returns the created userCard
 */
module.exports.absorb = async function absorb(request, response) {
  const user = request.user;
  const cardId = request.params.id;
  const newDate = new Date();

  const createdUserCard = await UserCard.create({
    userId: user._id,
    cardId,
    delay: 0,
    nextQuestionAt: newDate.valueOf(),
  });

  await response.status(201).json({
    user,
    cardId,
    createdUserCard
  });
};

module.exports.train = async function train(request, response) {
  const user = request.user;
  const currentDate = new Date();

  const userCards = await UserCard
    .find({
      userId: user._id,
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      },
    },
    )
    .sort({
      currentDelay: -1,
      nextQuestionAt: -1,
    })
    .find()
    .limit(displayedCardsLimit)
  ;

  // Merging properties
  const cards = await Promise.all(userCards.map(async (userCard) => {
    const card = await Card.findById(userCard.cardId);
    const createdCard = {
      ...userCard._doc,
      isOwnerOfCard: user._id.toString() === card.user.toString(),
      answer: card.answer,
      question: card.question || null,
      image: !!card.image.data ? card.image : null,
    };
    return createdCard
  }));

  response.status(200).json({
    cards: await cards,
    remainingCards: await UserCard.count({
      userId: user._id,
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      }
    })
  })
};


/**
 * Route : '/cards/:id'
 * Called when the user has answered, so we can update the card data
 * @param request
 * @param response
 * @returns {Promise<any>}
 */
module.exports.update = async function update(request, response) {

  const {newDelay} = request.body;
  if (!newDelay && newDelay !== 0) {
    response.status(400).json({message: 'Erreur, il manque le newDelay'});
    return;
  }

  const {id: cardId} = request.params;
  const userId = request.user._id;
  const card = await UserCard.findOne({cardId, userId});

  const nextQuestionAt = new Date();
  nextQuestionAt.setSeconds(nextQuestionAt.getSeconds() + newDelay);

  const wasLastAnswerSuccessful = newDelay > card.currentDelay;
  card.currentDelay = newDelay;
  card.nextQuestionAt = nextQuestionAt.valueOf();

  if (wasLastAnswerSuccessful) {
    card.currentSuccessfulAnswerStreak ++;
    const user = await User.findById(request.user._id);
    await user.updateExperience(card);
    await user.updateProgress(card);
  }
  else {
    card.currentSuccessfulAnswerStreak = 0;
  }

  await card.save();
  return response.json(card);
};


/**
 * Route /userCards/list/:_id
 * Sends back the complete list of cards assigned to a user
 * @param request.params._id : The _id of the user
 * @param response
 * @returns {Promise<void>}
 */
module.exports.list = async function list(request, response) {

  const userCards = await UserCard.find({userId: request.params._id}).select('cardId -_id');
  const cardIds = userCards.map(card => card.cardId);
  const cards = await Card.find({ '_id': { $in: cardIds } });

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
  console.log(formatedCards);

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
    createdCards ++;
  });
  await response.json({userCardsToBeTransfered});
};