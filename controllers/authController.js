const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchErrorsAsync = require('../utils/catchErrorsAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // remove password from response
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// TODO Create a special route to add roles or edit roles directly from DB
exports.signup = catchErrorsAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchErrorsAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Send token to client if all is okay
  createSendToken(user, 200, res);
});

exports.protect = catchErrorsAsync(async (req, res, next) => {
  // 1. Check if token is there and get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401)
    );
  }
  // 2. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('User belonging to the token no longer exists', 401)
    );
  }

  // 4. CHeck if user changed password after token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;

  next();
});

// Create a wrapper function that accepts an arbitrary number of roles and returns a middleware
exports.restrictTo =
  (...roles) =>
  (req, res, next) =>
    !roles.includes(req.user.role)
      ? next(new AppError('You are not authorized to perform this action', 403))
      : next();

exports.forgotPassword = catchErrorsAsync(async (req, res, next) => {
  // GET user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user with that email address', 404));
  }
  // Generate a random token
  const resetToken = user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  // Send it to user's email
  const resetURL = `${req.protocol}//${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? Click on the link below to reset.\n\n${resetURL}\n\nIf you din't request password reset please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token (Expires in 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (e) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;

    return next(
      new AppError(
        'Something went wrong sending the email. Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchErrorsAsync(async (req, res, next) => {
  // 1. GET user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2. If password has not expired and user exists, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
  createSendToken(user, 200, res);

  // 3. update changedPassAt to invalidate the previous token
  //  Done in the model using `pre` hook
});

exports.updatePassword = catchErrorsAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;
  // 1. Get user from collection
  const user = await User.findById(req.params.id).select('+password');

  // 2. Check if posted current password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(
      new AppError(
        'Provided password does not match the current password. Try again!',
        401
      )
    );
  }

  // 3. Update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4. Log user in, send JWT
  createSendToken(user, 201, res);
});
