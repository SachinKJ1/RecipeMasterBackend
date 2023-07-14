class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "fields"];
    // to remove them because they are needed for for other purposes
    excludedFields.forEach((el) => delete queryObj[el]); // delete will delete the properties of an object

    // advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|regex|options)\b/g, (match) => `$${match}`); // to put $ in front of gte, lte etc
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt _id");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

 
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Recipe.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist.');
    // }

    return this;
  }
}

module.exports = ApiFeatures;
