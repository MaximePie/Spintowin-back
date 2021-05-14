const mongoose = require('mongoose');
const { Schema } = mongoose;

const chapterSchema = Schema({
  title: {type: String, required: true},
  order: {type: Number},
  lessons:[ // Used for foreign key purpose
    {type: Schema.Types.ObjectId, ref: 'Lesson'}
  ]
});

const Lesson = mongoose.model('Chapter', chapterSchema);

module.exports = Lesson;
