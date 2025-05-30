const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  perfil: { type: Object, required: true },
  plan: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
