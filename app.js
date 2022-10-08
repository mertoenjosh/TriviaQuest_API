const express = require('express');
const morgan = require('morgan');

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
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} not found on this server.`,
  });

  next();
});

module.exports = app;
