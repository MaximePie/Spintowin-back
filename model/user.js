const mongoose = require('mongoose');
const { Schema } = mongoose;
const {requiredExpForNextLevel} = require('../data/levels');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 255,
    min: 6
  },
  experience: {
    type: Number,
    default: 0,
  },
  experienceRequiredForNextLevel: {
    type: Number,
    default: 1000,
  },
  level: {
    type: Number,
    default: 0,
  },
  cards:[ // Used for foreign key purpose
    {type: Schema.Types.ObjectId, ref: 'Card'}
  ]
});

// assign a function to the "methods" object of our userSchema
userSchema.methods.updateExperience = function(card, callBack = null) {
  const earnedExperience = Math.round(card.currentDelay / 100);
  this.experience += earnedExperience > 1 ? earnedExperience : 1;
  console.log("Current Experience : " + this.experience);
  if (this.experience >= this.experienceRequiredForNextLevel) {
    this.gainLevel();
  }
  return this.save();
};

userSchema.methods.gainLevel = function() {
  let experienceRequired = this.experienceRequiredForNextLevel;
  let remainingExperience = this.experience;
  let level = this.level;

  while (remainingExperience > experienceRequired) {
    remainingExperience -= experienceRequired;
    level ++;
    experienceRequired = requiredExpForNextLevel(level);

    console.log("Remaining : ", remainingExperience);
    console.log("Required : ", experienceRequired);
    console.log("Level : ", level);
  }

  this.experience = remainingExperience;
  this.level = level;
  this.experienceRequiredForNextLevel = experienceRequired;

  console.log("AFTER UPDATE : ");
  console.log("Remaining : ", remainingExperience);
  console.log("Required : ", experienceRequired);
  console.log("Level : ", level);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
