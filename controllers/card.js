const Card = require('../model/card');
const {cards} = require('../data/cards');
const fs = require("fs");


/**
 * Only use for testing purpose !
 * @param request
 * @param response
 */
function generate(request, response) {
  let added = 0;
  cards.forEach(card => {
    createCard(card.question, card.answer);
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
  if (request.body) {
    let errors = [];
    const {question, answer} = request.body;
    const file = request.file;
    let cardImage = undefined;

    response.json({
      message: "Allez, zou",
      question,
      answer,
      file,
    })
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
      createCard(question, answer, response, cardImage);
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

  const nextQuestionAt = new Date();
  nextQuestionAt.setSeconds(nextQuestionAt.getSeconds() + newDelay);

  await Card.findByIdAndUpdate(
    id,
    {
      currentDelay: newDelay,
      nextQuestionAt: nextQuestionAt.valueOf()
    },
    (error) => {
      let message = error || "OK";
      response.json({message})
    }
  );

}


async function index(request, response) {

  const currentDate = new Date();
  const totalCardsCount = await Card.count();
  const eligibleCardsCount = await Card
    .find({
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      }
    })
    .count();

  const cards = await Card
    .find({
      nextQuestionAt: {
        $lt: currentDate.valueOf()
      }
    })
    .sort({
      currentDelay: -1,
    })
    .find()
    .limit(50);

  response.status(200).json({
    cards: cards,
    total: totalCardsCount,
    current: totalCardsCount - eligibleCardsCount,
  })
}

/**
 * Creates a card with the given parameters
 * @param question
 * @param answer
 * @param response
 * @param image
 */
function createCard(question, answer, response = undefined, image = undefined) {
  const newDate = new Date();

  Card.create({
    question,
    answer,
    delay: 0,
    nextQuestionAt: newDate.valueOf(),
    image: image || null,
  }, (error, data) => {
    if (response) {
      response.status(200).json({message: 'La card a bien été créée ! Woohoo !', data, error});
    }
  });
}

async function stats(request, response) {
  const workInProgressData = await calculateWorkInProgress();
  const memorizedData = await calculateMemorizedData();
  const score = await calculateTotalScore();

  response.json({
    workInProgressData,
    memorizedData,
    score
  });
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
  return score.totalAmount;
}

async function calculateMemorizedData() {
  const minuteLength = 54;
  const hourLength = 60 * 60;
  const dayLength = 24 * hourLength;
  const weekLength = 7 * dayLength;
  const monthLength = 30 * dayLength;

  const results = {
    moreThanOneMinute: await Card.count({currentDelay: {$gt: minuteLength}}),
    moreThanOneHour: await Card.count({currentDelay: {$gt: hourLength}}),
    moreThanOneDay: await Card.count({currentDelay: {$gt: dayLength}}),
    moreThanOneWeek: await Card.count({currentDelay: {$gt: weekLength}}),
    moreThanOneMonth: await Card.count({currentDelay: {$gt: monthLength}}),
  };

  return results
}

async function calculateWorkInProgress() {

  const numberOfWorkinProgressCards = await Card.count({
    currentDelay: {$gt: 0}
  });
  const totalCards = await Card.count();

  const workInProgressPercentage = numberOfWorkinProgressCards * 100 / await Card.count();
  return {
    number: numberOfWorkinProgressCards,
    total: totalCards,
    percentage: workInProgressPercentage,
  }
}


module.exports.index = index;
module.exports.create = create;
module.exports.update = update;
module.exports.generate = generate;
module.exports.deleteAll = deleteAll;
module.exports.stats = stats;
