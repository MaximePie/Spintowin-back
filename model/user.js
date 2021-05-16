const mongoose = require('mongoose');
const { Schema } = mongoose;

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
  level: {
    type: Number,
    default: 0,
  },
  cards:[ // Used for foreign key purpose
    {type: Schema.Types.ObjectId, ref: 'Card'}
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
