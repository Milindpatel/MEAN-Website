const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true, lowercase: true, minlength: 3, maxlength: 50 },
  name: { type: String, trim: true, maxlength: 100 },
  password: { type: String, required: true },
});

// Never send the password hash to clients.
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
