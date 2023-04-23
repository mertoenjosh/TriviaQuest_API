const catchErrorsAsync = require('../utils/catchErrorsAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');

exports.createNewDocument = Model =>
  catchErrorsAsync(async (req, res, next) => {
    // const newDoc = new Model(req.body)
    // newDoc.save().then(err => {})

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });

exports.getAllDocuments = Model =>
  catchErrorsAsync(async (req, res, next) => {
    const totalDocs = await Model.countDocuments();
    const features = new APIFeatures(Model.find(), req.query, totalDocs)
      .filter()
      .sort()
      .paginate()
      .limitFields();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      requestedAt: req.requestTime,
      data: docs,
    });
  });

exports.getOneDocument = Model =>
  catchErrorsAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that Id`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateDocument = Model =>
  catchErrorsAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.deleteOne = Model =>
  catchErrorsAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
