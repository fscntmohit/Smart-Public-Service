const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin'],
    default: 'citizen',
  },
  department: {
    type: String,
    default: '',
  },
  area: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
