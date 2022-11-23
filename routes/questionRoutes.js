const express = require('express');
const questionController = require('../controllers/questionController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', questionController.checkId);

router
  .route('/easy')
  .get(questionController.getEasyQuestions, questionController.getAllQuestions);

router
  .route('/medium')
  .get(
    questionController.getMediumQuestions,
    questionController.getAllQuestions
  );

router
  .route('/hard')
  .get(questionController.getHardQuestions, questionController.getAllQuestions);

router
  .route('/api-stats')
  .get(authController.protect, questionController.getQuestionStats);

router
  .route('/')
  .get(questionController.getAllQuestions)
  .post(authController.protect, questionController.createQuestion);

router
  .route('/:id')
  .get(questionController.getQuestion)
  .patch(authController.protect, questionController.updateQuestion)
  .delete(
    authController.protect,
    authController.restrictTo('admin'), // TODO Contributor can only delete if its their question
    questionController.deleteQuestion
  );

module.exports = router;
