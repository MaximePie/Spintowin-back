import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  title: {type: String},
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
