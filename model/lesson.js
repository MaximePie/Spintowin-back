const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
  label: {type: String, required: true},
  url: {type: String},
  icon: {type: String},
  order: {type: Number, required: true},
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
