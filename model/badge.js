const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema({
  color: {type: String, required: true},
  imageUrl: {type: String, required: true},
  title: {type: String, required: true},
  requirementsDescription: {type: String, required: true},
  requiredField: {type: String, required: true},
  requiredAmount: {type: Number, required: true},
  level: {type: Number, default: 1},
});

const Schema = mongoose.model('Badge', badgeSchema);

module.exports = Schema;
