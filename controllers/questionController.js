/* eslint-disable prefer-object-spread */
const Question = require('../models/questionModel');
const catchErrorsAsync = require('../utils/catchErrorsAsync');
const factory = require('./handlerFactory');

exports.createQuestion = factory.createNewDocument(Question);

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

exports.getAllQuestions = factory.getAllDocuments(Question);

exports.getQuestion = factory.getOneDocument(Question);

exports.updateQuestion = factory.updateDocument(Question);

exports.deleteQuestion = factory.deleteOne(Question);

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
    error: false,
    message: 'success',
    data: stats,
  });
});
