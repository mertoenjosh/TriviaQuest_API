const User = require('../models/userModel');
const catchErrorsAsync = require('../utils/catchErrorsAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = factory.getAllDocuments(User);

exports.getUser = factory.getOneDocument(User);

exports.parmanentDeleteUser = factory.deleteOne(User);

exports.displayMe = catchErrorsAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.updateMe = catchErrorsAsync(async (req, res, next) => {
  // 1. Create error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Action can not be performed in this route. Please use `/updateMyPassword` to update password.',
        400
      )
    );
  }
  // 2. Update user
  // Filter to allow only allowed fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // return the updated object
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.deleteMe = catchErrorsAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
