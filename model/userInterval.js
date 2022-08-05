const mongoose = require('mongoose');
const User = require("./user");
const {intervals} = require("../data/cards");

const userIntervalSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interval: {
    type: Number,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    required: true,
    default: true,
  }
});

userIntervalSchema.methods = {
  enable: function() {
    this.isEnabled = true;
    this.save();
  },

  disable: function () {
    this.isEnabled = false;
    this.save();
  }
}

userIntervalSchema.statics = {
  createForUser: async (userId) => {
    const user = User.findById(userId);

    if (user) {
      for (const interval of intervals) {
        const existingUserInterval = await UserInterval.findOne({
          userId,
          interval
        });

        if (!existingUserInterval) {
          await UserInterval.create({
            userId: user._id,
            interval,
          })
        }
      }
    }
    else {
      throw new Exception("Erreur, l'utilisateur n'existe pas")
    }
  }
}

const UserInterval = mongoose.model('UserInterval', userIntervalSchema);

module.exports = UserInterval;
