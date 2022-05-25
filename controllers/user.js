const User = require('../model/user');
const UserWrongAnswer = require("../model/stats/userWrongAnswer");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Validation

const Joi = require('joi');
const mongoose = require("mongoose");
const UserAnswer = require("../model/stats/userAnswer");

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

module.exports.connectedUser = async function (request, response) {
  const user = await User.findById(request.user._id);
  return response.json(user);
};

/**
 * Route : /users/
 * @param request
 * @param response
 * @returns A complete list of the users of the app
 */
module.exports.index = async function (request, response) {
  const users = await User.find({});
  await response.json({users})
};

/**
 * Route : /users/connectedUser/scales
 * Returns some data about the progression of the user
 * (How many onGoing, how many with more than 1 minute, questions he has, ... and more
 * @param request
 * @param response
 */
module.exports.scales = async function (request, response) {
  const user = await User.findById(request.user._id);
  const results = await user.calculateMemorizedData();
  return response.json(results);
};

/**
 * Returns the wrong answer entities for the given user
 * Route: /users/connectedUser/wrongAnswers
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
module.exports.answers = async function (request, response) {
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

  const answersStats = answerDelays.map(({_id: delay, average: delayAverage, succesfulAnswers, wrongAnswers, total}) => {
    return {
      delay,
      delayAverage,
      successfulAnswersRate: Math.round(succesfulAnswers / total * 100)
    }
  });

  response.json({answersStats});
};


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
module.exports.progress = async function (request, response) {
  const user = await User.findById(request.user._id);
  if (user) {
    const results = await user.calculateProgressData();
    return response.json(results);
  }
  return null;
};

module.exports.badges = async function (request, response) {
  const user = await User.findById(request.user);
  const badges = await user.badges();
  return response.json(badges)
};

module.exports.updatePreferences = async function (request, response) {

  const { hasCategoriesDisplayed } = request.body;
  await User.findByIdAndUpdate(request.user, {
    hasCategoriesDisplayed
  });

  response.json(await User.findById(request.user));
};

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

module.exports.create = create;
module.exports.login = login;
