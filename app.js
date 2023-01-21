const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const questionRouter = require('./routes/questionRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MODDLEWARES
// Set security HTTP headers
app.use(helmet());

// Devleopment logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP to prevent ddos.
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  mesage: 'Too many requests from this IP. Try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['difficulty', 'category', 'tags'],
  })
);

// Implement CORS
app.use(cors());
app.options('*', cors());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/users', userRouter);
app.use('/', questionRouter);

// Handle all unimplemented routes
app.all('*', (req, res, next) => {
  const err = new AppError(
    `${req.originalUrl} not found on this server for that request. 💥💥`,
    404
  );

  next(err);
});

// Error middleware
app.use(globalErrorHandler);

module.exports = app;
