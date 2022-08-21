import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import mongoose from "mongoose"

import User from '../model/user/user.js';
import UserAnswer from "../model/stats/userAnswer.js"


const validationSchema = Joi.object({
  username: Joi.string().min(6).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

/**
 * Creates a new User
 * @param request
 * @param response
 */
async function create(request, response) {
  const {username, email, password, hasAdsEnabled} = request.body;
  const userCredentials = {
    username,
    email,
    password,
  };

  // Validation
  const validation = validationSchema.validate(userCredentials);
  if (validation.error) {
    return response.json({
      error: validation.error.details
    })
  }

  if (await emailExists(email)) {
    return response.json({
      message: "L'email est déjà utilisé",
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
    user.save().then((user) => {

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
  const {email, password} = request.body;
  if (await emailExists(email)) {
    const user = await User.findOne({email});
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
      return response.json({
        password: "Le mot de passe n'a pas été trouvé...",
      })
    }
  } else {
    return response.json({
      message: "Email non trouvé.",
    })
  }
}

async function connectedUser(request, response) {
  const user = await User.findById(request.user._id);
  return response.json({
    ...user._doc,
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
  await response.json({users})
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
      $match: {userId}
    },
    {
      $group:
        {
          _id: "$cardDelay",
          average: {$avg: "$answerDelay"},
          succesfulAnswers: {$sum: {$cond: ["$isSuccessful", 1, 0]}},
          wrongAnswers: {$sum: {$cond: ["$isSuccessful", 0, 1]}},
          total: {$count: {}}
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
      delay,
      delayAverage,
      successfulAnswersRate: Math.round(succesfulAnswers / total * 10000) / 100
    }
  });

  response.json({answersStats});
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
    intervals
  } = request.body;


  const user = await User.findById(request.user);
  const areIntervalsTheSame = intervals.every((val, idx) => val.isEnabled === user.intervals[idx].isEnabled);

  user.hasCategoriesDisplayed = hasCategoriesDisplayed;
  user.hasStreakNotifications = hasStreakNotifications;
  if (areIntervalsTheSame) { // Used to detect if intervals have changed since that this is an array of objects
    user.intervals = intervals;
  }
  await user.save();

  response.json({user});
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