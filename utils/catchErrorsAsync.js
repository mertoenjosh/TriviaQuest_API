const catchErrorsAsync = fn => (req, res, next) => {
  fn(req, res, next).catch(err => next(err));
};

module.exports = catchErrorsAsync;
