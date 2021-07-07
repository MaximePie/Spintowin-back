const {cards, intervals} = require('../data/cards');
const {badges} = require('../data/badges');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Card = require('../model/card');
const UserCardStat = require('../model/userCardStat');
const Badge = require('../model/badge');


module.exports.seed = async function (request, response) {

  await User.deleteMany({});
  await Card.deleteMany({});
  await UserCardStat.deleteMany({});
  await Badge.deleteMany({});

  await badges.forEach((badge) => {
    Badge.create(badge);
  })

  const hashedPassword = await bcrypt.hashSync('hahahaha', 8);
  const user = {
    username: "William",
    email: "williamsharpner2006@gmail.com",
    password: hashedPassword,
    experience: 0,
    level: 1,
  };

  await User.create(user);

  const createdUser = await User.findOne();
  const cardLimit = 50;
  let cardCounter = 0;
  const newDate = new Date();

  while (cardCounter < cardLimit) {

    const choosenInterval = intervals[Math.floor(Math.random() * 20)];

    const createdCard = await Card.create({
      ...cards[cardCounter],
      currentDelay: choosenInterval,
      user: createdUser._id,
      nextQuestionAt: newDate.valueOf(),
    });

    await createdUser.updateProgress(createdCard);

    cardCounter ++ ;
  }



  return response.status(200).json({
    user,
    cards: await Card.find(),
    userCards: await UserCardStat.find(),
    badges: await Badge.find(),
  });
}
