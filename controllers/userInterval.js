const {intervals} = require('../data/cards');
const UserInterval = require("../model/userInterval");
const User = require("../model/user");

module.exports = {
  /**
   * From /createIntervals
   * # DEVMODE ONLY
   * Create intervals for every user
   * @param request
   * @param response
   */
  create: async (request, response) => {

    const users = await User.find({});

    for (const user of users) {
      const userId = user._id;
      await UserInterval.createForUser(userId);
    }

    response.json('OK')
  }
};
