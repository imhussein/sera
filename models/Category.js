const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  category_title: {
    type: String,
    required: true,
  },
  created_At: {
    type: Date,
    default: Date.now,
  }
});

mongoose.model('categories', CategorySchema);