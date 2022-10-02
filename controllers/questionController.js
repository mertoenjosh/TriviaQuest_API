/* eslint-disable prefer-object-spread */
const Question = require('../models/questionModel');
const APIFeatures = require('../utils/APIFeatures');

exports.createQuestion = async (req, res) => {
  try {
    // const newQuestion = new Question(req.body)
    // newQuestion.save().then(err => {})

    const newQuestion = await Question.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        question: newQuestion,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

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

exports.getAllQuestions = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        question: updatedQuestion,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
