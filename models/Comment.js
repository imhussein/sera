const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  post_id: {
    type: String,
    required: true,
  },
  post_title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'UnApproved',
  },
  createdat: {
    type: Date,
    default: Date.now,
  }
})

mongoose.model('comments', CommentSchema);