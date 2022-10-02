const mongoose = require('mongoose');

const questionShema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: [true, 'A question is a required entry'],
    unique: [false, 'The question already exists in the database'],
    maxLength: [150, 'Make the question shorter'],
  },
  choices: {
    type: [String],
    required: [true, 'You must provide choices for the question'],
    minItems: [4, 'Provide four choices'],
    maxItems: [4, 'All choices provided must be unique'],
    uniqueItems: true,
  },
  correctAnswer: {
    type: String,
    trim: true,
    required: [true, 'Provide the answer to the question.'],
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
    minLength: [3, '`{VALUE}` is too short'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // disable from the schema, will not be served to client
  },
});

// Question model
const Question = mongoose.model('Question', questionShema);

module.exports = Question;
