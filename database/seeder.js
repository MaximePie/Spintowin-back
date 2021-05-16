const {cards} = require('../data/cards');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Card = require('../model/card');

/**
 * Represents the possible repetition intervals in seconds
 */
const intervals = [
  0,
  5,
  13,
  21,
  34,
  55,
  2 * 60,
  3 * 60,
  5 * 60,
  8 * 60,
  13 * 60,
  21 * 60,
  34 * 60,
  55 * 60,
  2 * 60 * 60, // 3h
  3 * 60 * 60, // 3h
  8 * 60 * 60, // 8h
  24 * 60 * 60, // 1j
  2 * 86400, // 2j
  3 * 86400,
  5 * 86400,
  8 * 86400,
  13 * 86400,
  21 * 86400,
  34 * 24 * 60 * 60,
  55 * 24 * 60 * 60,
  90 * 24 * 60 * 60, // 90 jours
  145 * 24 * 60 * 60,
  235 * 24 * 60 * 60,
  370 * 24 * 60 * 60, //
];



module.exports.seed = async function (request, response) {
  if (!process.env.CURRENT_ENVIRONMENT === 'local') {
    return response.status(401).json({
      message: "Le seed est réservé aux développeureuses",
    })
  }

  await User.deleteMany({});
  await Card.deleteMany({});

  const hashedPassword = await bcrypt.hashSync('hahahaha', 8);
  const user = {
    username: "William",
    email: "williamsharpner2006@gmail.com",
    password: hashedPassword,
    experience: 0,
    level: 1
  };
  await User.create(user);

  const createdUser = await User.findOne();
  const cardLimit = 100;
  let cardCounter = 0;
  const newDate = new Date();
  while (cardCounter < cardLimit) {

    const choosenInterval = intervals[Math.floor(Math.random() * 20)];

    await Card.create({
      ...cards[cardCounter],
      currentDelay: choosenInterval,
      user: createdUser._id,
      nextQuestionAt: newDate.valueOf(),
    })

    cardCounter ++ ;
  }

  return response.status(200).json({
    user,
    cards: await Card.find(),
  })
}
