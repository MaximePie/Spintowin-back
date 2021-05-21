const Card = require('../model/card');
const User = require('../model/user');
const {cards} = require('../data/cards');
const fs = require("fs");


async function test(request, response) {
  const user = request.user;

  const currentDate = new Date();
  const cards = await Card
    .find({
      user: user._id,
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      }
    })
    .sort({
      currentDelay: -1,
      nextQuestionAt: -1,
    })
    .limit(1)
    .skip(12);


  response.status(200).json({
    cards,
    allCards: await Card.find({}).sort({currentDelay: -1}).limit(3).sort({question: 1}),
  })
}

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

async function update(request, response) {

  const {newDelay} = request.body;
  if (!newDelay && newDelay !== 0) {
    response.status(400).json({message: 'Erreur, il manque le newDelay'});
    return;
  }

  const {id} = request.params;
  const card = await Card.findById(id);

  const nextQuestionAt = new Date();
  nextQuestionAt.setSeconds(nextQuestionAt.getSeconds() + newDelay);

  const wasLastAnswerSuccessful = newDelay > card.currentDelay;
  card.currentDelay = newDelay;
  card.nextQuestionAt = nextQuestionAt.valueOf();

  if (wasLastAnswerSuccessful) {
    User.findById(card.user, async (error, user) => {
      await user.updateExperience(card);
      await user.updateProgress(card);
    });
  }


  await card.save();
  return response.json(card);
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

async function index(request, response) {
  const user = request.user;
  const currentDate = new Date();

  const cards = await Card
    .find({
      user: user._id,
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      }
    })
    .sort({
      currentDelay: -1,
      nextQuestionAt: -1,
    })
    .find()
    .limit(12);

  response.status(200).json({
    cards: cards,
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
    delay: 0,
    nextQuestionAt: newDate.valueOf(),
    image: image || null,
    user: user._id,
  }, async (error, data) => {
    // Update the updatedUser list of cards
    const updatedUser = await User.findById(user._id, (error, user) => {
      user.cards.push(data._id);
      user.save();
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

async function stats(request, response) {
  const workInProgressData = await calculateWorkInProgress();
  const score = await calculateTotalScore();

  response.json({
    workInProgressData,
    score
  });
}

/**
 * TODO - OMG DELETE THIS, BIG DANGER !
 * @param request
 * @param response
 */
module.exports.attach = async function (request, response) {
  const cardsList = await Card.find({}, "_id");
  const {user: connectedUser} = request;
  const user = await User.findById(connectedUser._id);
  await Card.updateMany({}, {
    user: connectedUser._id,
  });
  const ids = cardsList.map((card) => {
    return card._id
  });
  const userCards = user?.cards || [];
  user.cards = [...userCards, ...ids];
  user.save();

  return response.json({
    message: "Prêt à tout changer. Aïe aïe aïe",
    ids,
    cardsList
  })
}

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


module.exports.test = test;
module.exports.index = index;
module.exports.getOne = getOne;
module.exports.create = create;
module.exports.update = update;
module.exports.generate = generate;
module.exports.deleteAll = deleteAll;
module.exports.stats = stats;
