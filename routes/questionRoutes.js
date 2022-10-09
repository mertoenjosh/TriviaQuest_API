const express = require('express');
const questionController = require('../controllers/questionController');

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

router.route('/api-stats').get(questionController.getQuestionStats);

router
  .route('/')
  .get(questionController.getAllQuestions)
  .post(questionController.createQuestion);

router
  .route('/:id')
  .get(questionController.getQuestion)
  .patch(questionController.updateQuestion)
  .delete(questionController.deleteQuestion);

module.exports = router;
