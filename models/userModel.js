const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    trim: true,
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'contributor', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must set a password'],
    minLength: [8, 'A password must be more than 8 characters long'],
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        // TODO: Use save even when updating a user
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: String,
    default: true,
    select: false,
  },
});

// Hash your password
userSchema.pre('save', async function (next) {
  // Guard clouse: Don't run when password isn't modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 12
  // the higher the cost the higher the security
  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

// Remove unwanted fields from response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;

  return userObj;
};

// set passwordUpdatedAt when password is updated.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // account for delay that may occur while
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // only select active accounts
  this.find({ active: { $ne: false } });

  next();
});

// check if password put is correct
userSchema.methods.correctPassword = async function (
  passwordFromReq,
  passwordFromDB
) {
  // candidatePassword, userPassword
  return await bcrypt.compare(passwordFromReq, passwordFromDB);
};

// Check if password has changed since token creation
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(JWTTimestamp < changedAtTimeStamp);
    return JWTTimestamp < changedAtTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
