const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(`UNCAUGHT EXCEPTION 💥. Shuting down...`);
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// To use a local database use this instead
// mongoose.connect(process.env.DATABASE_LOCAL, {
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Success !!'));

// Start Server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// Hanlde all unhandled rejections
process.on('unhandledRejection', err => {
  console.log(`UNHANDLED REJECTION 💥. Shuting down...`);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log(`SIGTERM RECEIVED. Shuting down gracefully...`);
  server.close(() => {
    console.log(`Process terminated 💣.`);
  });
});
