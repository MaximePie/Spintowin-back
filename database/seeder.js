const {cards, intervals} = require('../data/cards');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Card = require('../model/card');


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
    level: 1,
    startedCards: Math.round(Math.random() * 100),
    todayMinuteLengthCard: Math.round(Math.random() * 100),
    todayHourLengthCard: Math.round(Math.random() * 100),
    todayDayLengthCard: Math.round(Math.random() * 100),
    todayWeekLengthCard: Math.round(Math.random() * 100),
    todayMonthLengthCard: Math.round(Math.random() * 100),
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
