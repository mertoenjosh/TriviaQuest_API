const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const questionRouter = require('./routes/questionRoutes');

const app = express();

// MODDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware...');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/questions', questionRouter);

// Handle all unimplemented routes
app.all('*', (req, res, next) => {
  const err = new AppError(`${req.originalUrl} not found on this server.`, 404);

  next(err);
});

// Error middleware
app.use(globalErrorHandler);

module.exports = app;
