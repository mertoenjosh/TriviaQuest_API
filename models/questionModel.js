const mongoose = require('mongoose');
const validator = require('validator');

const questionShema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: [true, 'A question is a required entry'],
    unique: [true, 'The question already exists in the database'],
    maxLength: [150, 'Make the question shorter'],
    minLength: [10, 'A question must have more than 10 characters'],
  },
  choices: {
    type: [String],
    required: [true, 'You must provide choices for the question'],
    uniqueItems: true,
    validate: {
      validator: function (val) {
        const ans = new Set([...val]);

        return ans.size === 3; // only 3 unique wrong answers provided
      },
      message: 'You must provide 3 unique choices',
    },
  },
  correctAnswer: {
    type: String,
    trim: true,
    required: [true, 'Provide the answer to the question'],
    validate: {
      validator: function (val) {
        // TODO: 'this' does not work on update find a better way
        return !this.choices.includes(val); // answer not in wrong answers already
      },
      message: '`{VALUE}` already provided as a wrong answer',
    },
  },
  tags: [String],
  category: {
    type: String,
    enum: [
      'sports',
      'science',
      'arts',
      'film',
      'fashion',
      'general_knowledge',
      'music',
      'history',
      'culture',
      'geography',
      'food & drinks',
    ],
    required: [true, 'State the category of your question'],
  },
  difficulty: {
    enum: ['easy', 'medium', 'hard'],
    type: String,
    required: [true, 'State the difficulty level of your question'],
  },
  author: {
    type: String,
    trim: true,
    maxLength: [15, 'Try a shorter name'],
    minLength: [3, 'Name `{VALUE}` is too short'],
    validate: [validator.isAlpha, 'Name should only consist of characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // disable from the schema, will not be served to client
  },
});

// Calculate how long 'find' queries take with pre and post query hooks
questionShema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

questionShema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} ms!`);
  next();
});

// Question model
const Question = mongoose.model('Question', questionShema);

module.exports = Question;
