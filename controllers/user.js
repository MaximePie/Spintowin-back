import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import mongoose from "mongoose"

import User from '../model/user/user.js';
import UserAnswer from "../model/stats/userAnswer.js"
import moment from "moment";


const validationSchema = Joi.object({
  username: Joi
    .string()
    .min(6)
    .required()
    .messages({
      'string.empty': `Le nom d'utilisateur est requis`,
      'string.min': `Le nom d'utilisateur doit contenir au moins 6 caractères`,
    })
  ,
  email: Joi.string().min(6).required().email()
    .messages({
      'string.empty': `L'email est requis`,
      'string.min': `L'email doit contenir au moins 6 caractères`,
      'string.email': `L'email n'est pas valide`,
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.empty': `Le mot de passe est requis`,
      'string.min': `Le mot de passe doit contenir au moins 6 caractères`,
    }),
});

/**
 * Creates a new User
 * The error has to be in an array because of the way Joi works
 * [error: [{message: "error message"}]]
 * @param request
 * @param response
 */
async function create(request, response) {
  const { username, email, password, hasAdsEnabled } = request.body;
  const userCredentials = {
    username,
    email,
    password,
  };

  // Validation
  const validation = validationSchema.validate(userCredentials);
  if (validation.error) {
    return response.status(400).json({
      errors: validation.error.details
    })
  }

  if (await emailExists(email)) {
    return response.status(400).json({
      errors: [{
        message: "L'email existe déjà",
      }]
    })
  }

  const hashedPassword = await bcrypt.hashSync(password, 8);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    hasAdsEnabled,
    role: "user",
  });
  try {
    user.save().then(async (user) => {
      await user.initializeIntervals();

      const token = jwt.sign({
          _id: user._id,
        },
        process.env.TOKEN_SECRET
      );
      return response.json({
        user: user._id,
        token,
      })
    })
  } catch (errors) {
    response.json({
      errors
    });
  }
}

async function login(request, response) {
  const { email, password } = request.body;
  if (await emailExists(email)) {
    const user = await User.findOne({ email });
    if (await isPasswordValid(password, user.password)) {
      const token = jwt.sign({
          _id: user._id,
        },
        process.env.TOKEN_SECRET
      );

      response.header('auth-token', token).json({
        token,
      })
    } else {
      return response.status(401).json({
        password: "Le mot de passe n'a pas été trouvé...",
      })
    }
  } else {
    return response.status(401).json({
      message: "Email non trouvé.",
    })
  }
}

async function connectedUser(request, response) {
  const userInBase = await User.findById(request.user._id);
  const result = {
    user: {
      ...userInBase._doc,
      remainingCards: await userInBase.notStartedQuestionsCount(),
      remainingCardsOld: await userInBase.remainingQuestionsCount(),
    }
  };

  return response.json({
    ...result.user
  });
}

/**
 * Route : /users/
 * @param request
 * @param response
 * @returns A complete list of the users of the app
 */
async function index(request, response) {
  const users = await User.find({});
  await response.json({ users })
}

/**
 * Route : /users/connectedUser/scales
 * Returns some data about the progression of the user
 * (How many onGoing, how many with more than 1 minute, questions he has, ... and more
 * @param request
 * @param response
 */
async function scales(request, response) {
  const user = await User.findById(request.user._id);
  const results = await user.calculateMemorizedData();
  return response.json(results);
}

/**
 * Returns the wrong answer entities for the given user
 * Route: /users/connectedUser/wrongAnswers
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
async function answers(request, response) {
  const userId = mongoose.Types.ObjectId(request.user._id);

  const answerDelays = await UserAnswer.aggregate(([
    {
      $match: { userId }
    },
    {
      $group:
        {
          _id: "$cardDelay",
          average: { $avg: "$answerDelay" },
          succesfulAnswers: { $sum: { $cond: ["$isSuccessful", 1, 0] } },
          wrongAnswers: { $sum: { $cond: ["$isSuccessful", 0, 1] } },
          total: { $count: {} }
        },
    },
  ]));

  const answersStats = answerDelays.map(({
                                           _id: delay,
                                           average: delayAverage,
                                           succesfulAnswers,
                                           wrongAnswers,
                                           total
                                         }) => {
    return {
      total,
      delay,
      delayAverage,
      successfulAnswersRate: Math.round(succesfulAnswers / total * 10000) / 100
    }
  });

  response.json({ answersStats });
}


/**
 * Route : /users/connectedUser/progress
 * Returns some data about the progression of the user
 * How many cards in total
 * how many already started
 * how many learned today
 *
 * @param request
 * @param response
 */
async function progress(request, response) {
  const user = await User.findById(request.user._id);
  if (user) {
    const results = await user.calculateProgressData();
    return response.json(results);
  }
  return null;
}

async function badges(request, response) {
  const user = await User.findById(request.user);
  const badges = await user.badges();
  return response.json(badges)
}

async function updatePreferences(request, response) {

  const {
    hasCategoriesDisplayed,
    hasStreakNotifications,
    hasSoundEnabled,
    intervals,
    limitDate,
  } = request.body;


  const user = await User.findById(request.user);
  if (intervals && 1 < intervals.length) {
    const areIntervalsTheSame = intervals.every((val, idx) => val.isEnabled === user.intervals[idx].isEnabled);
    if (areIntervalsTheSame) { // Used to detect if intervals have changed since that this is an array of objects
      user.intervals = intervals;
    }
  }

  if (hasStreakNotifications !== undefined) {
    user.hasStreakNotifications = hasStreakNotifications;
  }

  if (hasCategoriesDisplayed !== undefined) {
    user.hasCategoriesDisplayed = hasCategoriesDisplayed;
  }

  if (hasSoundEnabled !== undefined) {
    user.hasSoundEnabled = hasSoundEnabled;
  }


  if (limitDate) {
    user.limitDate = moment(limitDate, "DD/MM/YYYY").toDate();
  }

  await user.save();

  response.json({ user });
}

/**
 * Checks if the second parameter matches the first one
 * @param databasePassword
 * @param testedPassword
 */
function isPasswordValid(testedPassword, databasePassword) {
  return bcrypt.compare(testedPassword, databasePassword);
}

/**
 * Checks if the email exists in database
 * @param email
 */
function emailExists(email) {
  return User.findOne({
    email
  });
}

const userController = {
  connectedUser,
  index,
  scales,
  answers,
  progress,
  badges,
  updatePreferences,
  create,
  login,
};

export default userController