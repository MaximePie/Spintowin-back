import fs from "fs"
import { s3 } from "../server.js";

import Card from '../model/Card/card.js'
import UserCard from '../model/userCard.js'
import User from '../model/user/user.js'
import { cards } from '../data/cards.js'

async function deleteCard(request, response) {
  const deletedCard = await Card.deleteOne({ _id: request.params.id });
  await UserCard.deleteOne({ cardId: request.params.id });
  response.status(200).json(deletedCard)
}

async function editCard(request, response) {
  const { id } = request.params;
  const { question, answer, hint } = request.body;
  const card = await Card.findById(id);

  if (question) {
    card.question = question;
  }

  if (answer) {
    card.answer = answer;
  }

  // push the hint in the card list of hints
  if (hint) {
    card.hints.push(hint);
  }

  if (answer || question || hint) {
    await card.save();
  }
  response.status(200).json(card)
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
  response.json({ added });
}

/**
 * WARNING, this method deletes all the entries in the database !
 * Use for test purpose only ! (Please please please)
 */
function deleteAll(request, response) {
  Card.deleteMany({
    currentDelay: { $gte: 0 },
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
async function create(request, response) {
  const { user } = request;
  if (request.body) {
    let errors = [];
    const { question, answer, category, shouldCreateReverseQuestion } = request.body;
    const { file } = request;
    let uploadedImage = undefined;
    if (file) {
      const { path, filename } = file;
      const blob = fs.readFileSync(path);
      console.log("File is ", file);
      console.log("Body is ", request.body);
      try {
        uploadedImage = await s3.upload({
          Bucket: "flashcard-images",
          Key: filename,
          // Body: blob,
          ACL: "public-read",
        }).promise();
      }
      catch (error) {
        console.log(error);
        return response.status(500).send("Il y a eu une erreur lors de l'upload de l'image");
      }
    }
    if (!question && !file) {
      errors.push('Erreur, il faut un question');
    }

    if (answer === undefined) {
      errors.push('Erreur, il faut un answer');
    }

    if (errors.length) {
      response.status(400).json({ message: errors });
    } else {
      createCard(question, answer, user, response, uploadedImage, category);

      if ('true' === shouldCreateReverseQuestion && !file) {
        createCard(answer, question, user, response, uploadedImage, category);
      }

      response.status(200).json({ message: "La carte va être créée." })
    }
  } else {
    response.status(404).json({ message: 'Aucun body trouvé' });
  }
}

async function bulkCreate(request, response) {
  const { user } = request;
  let added = 0;
  // read the csv file
  const { file } = request;
  if (file) {
    const data = fs.readFileSync(file.path, 'utf8');
    const lines = data.split('\r').map(line => {
      // remove the \n and make an object with the question as a key and the answer as a value
      const formatedAnswer = line.replace('\n', '').split(',');
      return {
        question: formatedAnswer[0],
        answer: formatedAnswer[1],
      }
    });
    const category = lines[0].question;
    lines.shift();
    await Promise.all(
      lines.map(async ({ question, answer }) => {
        // if quest and answer are not null
        if (question && answer) {
          await createCard(question, answer, user, undefined, undefined, category);
          await createCard(answer, question, user, undefined, undefined, category);
          added++;
        }
      })
    );

    response.json({ added });
  }

}

async function getOne(request, response) {
  const user = request.user;
  const lastCard = await Card.findById(request.query.lastCardId);

  const card = await Card.findOne({
    user: user._id,
    nextQuestionAt: {
      $lt: lastCard.nextQuestionAt,
    },
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
 * @param category
 */
function createCard(question, answer, user, response = undefined, image = undefined, category = undefined) {
  const newDate = new Date();

  console.log(`Creating card with question ${question} and answer ${answer} and category ${category} for user ${user._id}`);

  Card.create({
    question,
    answer,
    image: image?.Location || null,
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
      categoryId: category || null,
    });
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
  const filter = { $match: { currentDelay: { $gt: 0 } } };
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
    currentDelay: { $gt: 0 }
  });
  const totalCards = await Card.countDocuments();

  const workInProgressPercentage = numberOfWorkinProgressCards * 100 / await Card.countDocuments();
  return {
    number: numberOfWorkinProgressCards,
    total: totalCards,
    percentage: workInProgressPercentage,
  }
}

const cardsController = {
  deleteCard,
  editCard,
  getOne,
  create,
  bulkCreate,
  deleteAll,
  stats,
}

export default cardsController;