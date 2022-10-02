const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/questionModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// You can use a local database
// mongoose.connect(process.env.DATABASE_LOCAL, {
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Success !!'));

// READ JSON FILE
const questions = JSON.parse(
  fs.readFileSync(`${__dirname}/quiz-sample.json`, 'utf-8')
);

// IMPORT DATA
const importData = async () => {
  try {
    await Question.create(questions);
    console.log('Data loaded successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all initial data from database
const deleteData = async () => {
  try {
    await Question.deleteMany();
    console.log('Initial data deleted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log(`\n[usage]:\n\tnode ${__filename} <command>`);
  process.exit();
}
