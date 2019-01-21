const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  user: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'published',
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

mongoose.model('posts', PostSchema);