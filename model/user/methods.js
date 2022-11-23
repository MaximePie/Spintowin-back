import mongoose from "mongoose";
import moment from "moment";
import { displayedCardsLimit, requiredExpForNextLevel } from "../../data/config.js";

import Card from '../Card/card.js'
import UserBadge from '../userBadge.js'
import Badge from '../badge.js'
import UserCardStat from '../userCardStat.js'
import {
  startedInterval,
  minuteInterval,
  hourInterval,
  dayInterval,
  weekInterval,
  monthInterval,
  intervals
} from '../../data/cards.js'
import UserCard from "../userCard.js"


/**
 * Set interval for the user based on the defaults listed in /data/cards
 */
export async function initializeIntervals() {
  console.log("Initializing intervals");
  this.intervals = [];
  intervals.forEach(interval => {
    this.intervals.push({
      value: interval,
      isEnabled: true,
    })
  });
  return this.save();
}

export async function remainingQuestionsCount() {
  const currentDate = new Date();

  return UserCard.count({
    userId: this._id,
    nextQuestionAt: {
      $lt: currentDate.valueOf()
    },
    isMemorized: false,
  })
}

/**
 * Return the number of questions to review
 * with a currentDelay lower or equal than 5 or null
 * @returns {Promise<*>}
 */
export async function notStartedQuestionsCount() {
  const currentDate = new Date();

  return UserCard.count({
    userId: this._id,
    $or : [
      {
        currentDelay: {
          $lte: 5,
        },
      },
      {
        currentDelay: null,
      }
    ],
    isMemorized: false,
  })
}


/**
 * Returns the reviewQuestions onGoing query for the User
 *
 * @param categories {array} of question Categories
 * @return {QueryWithHelpers<Array<Document<any, any>>, Document<any, any>, {}>}
 */
export async function reviewQuestions(categories = []) {
  const currentDate = new Date();
  const query = {
    userId: this._id,
    nextQuestionAt: {
      $lt: currentDate.valueOf()
    },
    isMemorized: {
      $ne: true,
    },
    currentDelay: {
      $ne: 5,
    }
  };

  if (categories.length) {
    query.categoryId = {
      $in: categories.map(category => mongoose.Types.ObjectId(category))
    }
  }
  return UserCard
    .find(query)
    .sort({
      currentDelay: -1,
      nextQuestionAt: 1,
    })
    .limit(displayedCardsLimit)
    .skip(displayedCardsLimit * 1)
    .populate('cardId')
    .populate('categoryId')
    .find()
}

export async function calculateMemorizedData() {
  const cards = Card.find({
    user: this._id,
    currentDelay: {
      $gt: 0,
    }
  });
  const minuteLength = 54;
  const hourLength = 60 * 60;
  const dayLength = 24 * hourLength;
  const weekLength = 7 * dayLength;
  const monthLength = 30 * dayLength;

  const todayMinuteLengthCard = await UserCardStat.count({
    isMinuteLengthCard: true,
    userId: this._id,
  });
  const todayHourLengthCard = await UserCardStat.count({
    isHourLengthCard: true,
    userId: this._id,
  });
  const todayDayLengthCard = await UserCardStat.count({
    isDayLengthCard: true,
    userId: this._id,
  });
  const todayWeekLengthCard = await UserCardStat.count({
    todayWeekLengthCard: true,
    userId: this._id,
  });
  const todayMonthLengthCard = await UserCardStat.count({
    todayMonthLengthCard: true,
    userId: this._id,
  });

  return {
    total: await cards.count(),
    moreThanOneMinute: await cards.countDocuments({ currentDelay: { $gte: minuteLength } }),
    moreThanOneHour: await cards.countDocuments({ currentDelay: { $gte: hourLength } }),
    moreThanOneDay: await cards.countDocuments({ currentDelay: { $gte: dayLength } }),
    moreThanOneWeek: await cards.countDocuments({ currentDelay: { $gte: weekLength } }),
    moreThanOneMonth: await cards.countDocuments({ currentDelay: { $gte: monthLength } }),
    startedCards: await UserCardStat.count(),
    todayMinuteLengthCard,
    todayHourLengthCard,
    todayDayLengthCard,
    todayWeekLengthCard,
    todayMonthLengthCard,
    userId: this._id,
  }
}

export async function calculateProgressData() {
  const userId = this._id;
  const today = await Card
    .find({ currentDelay: 5, user: userId })
    .then(async (cards) => {
      return UserCardStat.count({
        userId,
        cardId: {
          $in: cards.map(card => card._id)
        }
      })
    });

  return {
    total: await Card.count({ user: this._id }),
    today,
    started: await Card.count({
      currentDelay: { $gt: 0 }
    }),
  };
}

export async function checkLastActivity() {
  const todayDate = moment();
  const lastDay = moment(this.lastActivity);
  if (!this.lastActivity || !todayDate.isSame(lastDay, "d")) {
    await UserCardStat.deleteMany({ userId: this._id });
    this.lastActivity = moment().toDate();
    this.save();
  }
}

export async function badges() {
  const userId = this._id;
  const userBadges = await UserBadge.find({ userId }).then(async userBadges => {
    // On renvoie le résultat de la promesse
    const badges = await Badge.find({ _id: { $in: userBadges.map(({ badgeId }) => badgeId) } });

    // Calculating top badges in each category
    const addedCardsBadge = UserBadge.topBadgeFromCategory(badges, "addedCards");
    const oneDayCardsBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneDay");
    const oneWeekCardBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneWeek");
    const oneMonthCardBadge = UserBadge.topBadgeFromCategory(badges, "memorizedCardsMoreThanOneMonth");
    const filteredBadges = [
      addedCardsBadge,
      oneDayCardsBadge,
      oneWeekCardBadge,
      oneMonthCardBadge
    ].filter(badge => badge !== undefined);

    return Promise.all(filteredBadges.map(async badge => {
      if (badge) {
        const current = await this.currentProgressForBadge(badge.requiredField, userId);
        const requiredForNextBadge = await UserBadge.requiredProgressForNextBadge(badge);
        return {
          badge,
          current,
          required: requiredForNextBadge.requiredAmount,
        }
      }

      return {}
    }));
  });
  return userBadges
}

export async function currentProgressForBadge(badgeType, userId) {
  // L'user se met à jour
  let currentValue = 0;
  switch (badgeType) {
    case "addedCards":
      currentValue = await Card.countDocuments({ user: userId });
      break;
    case "memorizedCardsMoreThanOneDay":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: { $gte: dayInterval },
      });
      break;
    case "memorizedCardsMoreThanOneWeek":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: { $gte: weekInterval },
      });
      break;
    case "memorizedCardsMoreThanOneMonth":
      currentValue = await Card.countDocuments({
        user: userId,
        currentDelay: { $gte: monthInterval },
      });
      break;
    default:
      currentValue = 0;
      break;
  }
  return currentValue;
}

export async function checkAchievements() {

  const check = async (badgeType) => {
    const userId = this._id;
    const testedValue = await this.currentProgressForBadge(badgeType, userId);
    const availableBadges = await Badge.find({
      requiredField: badgeType,
      requiredAmount: {
        $lte: testedValue,
      }
    });

    const availableBadgesIds = availableBadges.map(badge => badge._id);
    const descernedBadgesForUser = await UserBadge.count({ userId, badgeId: { $in: availableBadges } });

    if (descernedBadgesForUser !== availableBadgesIds.length) {
      const undescernedBadgesForUser = await Badge
        .find({
          requiredField: badgeType,
          requiredAmount: {
            $lte: testedValue,
          }
        })
        .then(async badges => {
          const undescerned = [];
          for (const badge of badges) {
            const { _id: badgeId } = badge;
            const isDescerned = await UserBadge.findOne({ userId, badgeId });
            if (!isDescerned) {
              undescerned.push(badge);
            }
          }
          return undescerned;
        });

      undescernedBadgesForUser.forEach(badge => {
        UserBadge.create({
          userId,
          badgeId: badge._id,
        })
      });
      return undescernedBadgesForUser;
    } else {
      return [];
    }
  }

  return [
    ...await check("addedCards"),
    ...await check("memorizedCardsMoreThanOneDay"),
    ...await check("memorizedCardsMoreThanOneWeek"),
    ...await check("memorizedCardsMoreThanOneMonth"),
  ];
}

export async function updateProgress(userCard) {
  // Si la carte est déjà dans la liste, ne pas l'ajouter, mais vider ses champs et ajouter le bon

  const existingUserCard = await UserCardStat.findOne({ cardId: userCard.cardId });
  let interval = "";

  switch (userCard.currentDelay) {
    case monthInterval:
      interval = "month";
      break;
    case weekInterval:
      interval = "week";
      break;
    case dayInterval:
      interval = "day";
      break;
    case hourInterval:
      interval = "hour";
      break;
    case minuteInterval:
      interval = "minute";
      break;
    case startedInterval:
      interval = "started";
      break;
  }
  if (existingUserCard && interval) {
    await existingUserCard.updateInterval(interval);
  } else {
    await UserCardStat.createUserCardStat(this._id, userCard.cardId, interval);
  }

  await this.save();
}

export async function updateExperience(card, callBack = null) {
  const earnedExperience = Math.round(card.currentDelay / 100);
  this.experience += 1 < earnedExperience ? earnedExperience : 1;
  if (this.experience >= this.experienceRequiredForNextLevel) {
    this.gainLevel();
  }
  return this.save();
}

export async function gainLevel() {

  let experienceRequired = this.experienceRequiredForNextLevel;
  let remainingExperience = this.experience;
  let level = this.level;

  while (remainingExperience > experienceRequired) {
    remainingExperience -= experienceRequired;
    level++;
    experienceRequired = requiredExpForNextLevel(level);
  }

  this.experience = remainingExperience;
  this.level = level;
  this.experienceRequiredForNextLevel = experienceRequired;
}
