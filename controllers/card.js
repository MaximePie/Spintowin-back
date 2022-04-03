
const Card = require('../model/card');
const UserCard = require('../model/userCard');
const User = require('../model/user');
const UserWrongAnswer = require("../model/userWrongAnswer");
const {cards} = require('../data/cards');
const fs = require("fs");

module.exports.delete = async function deleteCard(request, response) {
  const deletedCard = await Card.deleteOne({_id: request.params.id});
  await UserCard.deleteOne({cardId: request.params.id});
  await response.status(200).json(deletedCard)
};

module.exports.edit = async function editCard(request, response) {
  const {id} = request.params;
  const {question, answer } = request.body;
  const card = await Card.findById(id);

  if (question) {
    card.question = question;
  }

  if (answer) {
    card.answer = answer;
  }

  if (answer || question) {
    await card.save();
  }
  response.status(200).json(card)
};


/**
 * Only use for testing purpose !
 * @param request
 * @param response
 */
function generate(request, response) {
  const user = request.user;
  let added = 0;
  cards.forEach(card => {
    createCard(card.question, card.answer, user);
    added++;
  });
  response.json({added});
}

/**
 * WARNING, this method deletes all the entries in the database !
 * Use for test purpose only ! (Please please please)
 */
function deleteAll(request, response) {
  Card.deleteMany({
    currentDelay: {$gte: 0},
  }, (error, results) => {
    response.json({
      results,
    })
  });
}

/**
 * Creates a new Card with IMAGE based on the request body parameters
 * @param request
 * @param response
 */
function create(request, response) {
  const {user} = request;
  if (request.body) {
    let errors = [];
    const {question, answer} = request.body;
    const file = request.file;
    let cardImage = undefined;
    if (file) {
      const {path, mimetype} = request.file;
      cardImage = {
        data: fs.readFileSync(path),
        contentType: mimetype
      }
    }
    if (!question && !file) {
      errors.push('Erreur, il faut un question');
    }

    if (answer === undefined) {
      errors.push('Erreur, il faut un answer');
    }

    if (!errors.length) {
      createCard(question, answer, user, response, cardImage);
    } else {
      response.status(400).json({message: errors});
    }
  } else {
    response.status(404).json({message: 'Aucun body trouvé'});
  }
}

async function getOne(request, response) {
  const user = request.user;
  const lastCard = await Card.findById(request.query.lastCardId);

  const card = await Card.findOne({
    user: user._id,
    nextQuestionAt: {
      $lt: lastCard.nextQuestionAt,
    }
  })
  .sort({
    nextQuestionAt: -1,
  });

  response.status(200).json({
    card,
    lastCard,
  })
}

/**
 * Creates a card with the given parameters
 * @param question
 * @param answer
 * @param user The user we want to attach to the Card
 * @param response
 * @param image
 */
function createCard(question, answer, user, response = undefined, image = undefined) {
  const newDate = new Date();

  Card.create({
    question,
    answer,
    image: image || null,
    user: user._id,
  }, async (error, data) => {
    // Update the updatedUser list of cards
    const updatedUser = await User.findById(user._id, (error, user) => {
      user.cards.push(data._id);
      user.save();
    });
    UserCard.create({
      userId: user._id,
      cardId: data._id,
      delay: 0,
      nextQuestionAt: newDate.valueOf(),
    });

    if (response) {
      response.status(200).json({
        message: 'La card a bien été créée ! Woohoo !',
        data,
        error,
        updatedUser,
      });
    }
  });
}

/**
 * Fetch the work in progress data for the user
 * Fetch the score for the user
 * Fetch the wrong answers data for the user
 * @param request
 * @param response
 * @returns {wrongAnswers, score, workInProgressData}
 */
async function stats(request, response) {
  const workInProgressData = await calculateWorkInProgress();
  const score = await calculateTotalScore();

  response.json({
    workInProgressData,
    score,
  });
}

/**
 * Returns the total score of the user
 */
async function calculateTotalScore() {
  const filter = {$match: {currentDelay: {$gt: 0}}};
  const accumulator = {
    $group: {
      _id: null,
      totalAmount: {
        $sum: "$currentDelay"
      },
    }
  };

  const [score] = await Card.aggregate([filter, accumulator]);
  return score?.totalAmount || 0;
}

async function calculateWorkInProgress() {

  const numberOfWorkinProgressCards = await Card.countDocuments({
    currentDelay: {$gt: 0}
  });
  const totalCards = await Card.countDocuments();

  const workInProgressPercentage = numberOfWorkinProgressCards * 100 / await Card.countDocuments();
  return {
    number: numberOfWorkinProgressCards,
    total: totalCards,
    percentage: workInProgressPercentage,
  }
}


module.exports.getOne = getOne;
module.exports.create = create;
module.exports.generate = generate;
module.exports.deleteAll = deleteAll;
module.exports.stats = stats;
