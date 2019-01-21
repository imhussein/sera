const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Unapproved',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  avatarUrl: {
    type: String,
  }
});

mongoose.model('users', UsersSchema);