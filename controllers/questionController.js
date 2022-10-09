/* eslint-disable prefer-object-spread */
const Question = require('../models/questionModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const catchErrorsAsync = require('../utils/catchErrorsAsync');

exports.createQuestion = catchErrorsAsync(async (req, res, next) => {
  // const newQuestion = new Question(req.body)
  // newQuestion.save().then(err => {})

  const newQuestion = await Question.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      question: newQuestion,
    },
  });
});

exports.getEasyQuestions = (req, res, next) => {
  req.query.difficulty = 'easy';
  next();
};

exports.getMediumQuestions = (req, res, next) => {
  req.query.difficulty = 'medium';
  next();
};

exports.getHardQuestions = (req, res, next) => {
  req.query.difficulty = 'hard';
  next();
};

exports.getAllQuestions = catchErrorsAsync(async (req, res, next) => {
  const questionsCount = await Question.countDocuments();
  const features = new APIFeatures(Question.find(), req.query, questionsCount)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const questions = await features.query;

  res.status(200).json({
    status: 'success',
    results: questions.length,
    requestedAt: req.requestTime,
    data: {
      questions: questions,
    },
  });
});

exports.getQuestion = catchErrorsAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new AppError(`No question found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      question,
    },
  });
});

exports.updateQuestion = catchErrorsAsync(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!question) {
    return next(new AppError(`No question found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      question,
    },
  });
});

exports.deleteQuestion = catchErrorsAsync(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id);

  if (!question) {
    return next(new AppError(`No question found with that ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//TODO: Remove this handle
exports.deleteAllQuestions = catchErrorsAsync(async (req, res, next) => {
  await Question.deleteMany();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getQuestionStats = catchErrorsAsync(async (req, res, next) => {
  const stats = await Question.aggregate([
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        totalCount: { $sum: 1 },
        // TODO get stats of each category per difficulty level
        // TODO get stats of each tag
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
