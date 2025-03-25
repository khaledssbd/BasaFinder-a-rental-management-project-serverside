import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
              //  }) ,
            }) as FilterQuery<T>, // ei line comment kore uporerta uncomment dileo hoy
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // filtering
    const excludeFields = [
      'searchTerm',
      'sort',
      'page',
      'limit',
      'fields',
      'minRent',
      'maxRent',
    ];
    excludeFields.forEach((field) => delete queryObj[field]); // exact match with field name

    // this.modelQuery = this.modelQuery.find(queryObj);
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>); // uporerta dileo hoy

    return this;
  }

  range() {
    const minRent = Number(this?.query?.minRent);
    const maxRent = Number(this?.query?.maxRent);

    const filter: { rent?: { $gte?: number; $lte?: number } } = {};

    if (minRent && maxRent) {
      filter['rent'] = { $gte: minRent, $lte: maxRent };
    } else if (minRent) {
      filter['rent'] = { $gte: minRent };
    } else if (maxRent) {
      filter['rent'] = { $lte: maxRent };
    }

    this.modelQuery = this.modelQuery.find(filter as FilterQuery<T>);

    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';

    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__V';

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
