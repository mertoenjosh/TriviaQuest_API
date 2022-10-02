class APIFeatures {
  constructor(query, queryObject, itemsCount) {
    this.query = query;
    this.queryObject = queryObject;
    this.itemsCount = itemsCount;
  }

  filter() {
    // 1. FILTER
    const queryObj = { ...this.queryObject };
    const excludedWords = ['page', 'limit', 'sort', 'fields'];
    excludedWords.forEach(el => delete queryObj[el]);

    // 1.2 Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    // 2. SORT
    if (this.queryObject.sort) {
      // TODO implement sort by ratings in future
      const sortBy = this.queryObject.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3. FIELD LIMITING
    if (this.queryObject.fields) {
      const fields = this.queryObject.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // exclude the '__v' field
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const limit = this.queryObject.limit * 1 || 6;
    const random = Math.floor(Math.random() * (this.itemsCount / limit)) + 1;
    const page = this.queryObject.page * 1 || random;
    const skip = (page - 1) * limit; // e.g page 3 with 10 results each page == skip 20 -> page - 1 * limit

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
