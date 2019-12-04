const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  address: String,
  phone: String,
  password: String,
  socketId: String
});

module.exports = mongoose.model('User', UserSchema);
