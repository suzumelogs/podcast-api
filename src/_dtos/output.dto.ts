export interface Pagination {
  total: number;
  page: number;
  limit: number;
  next?: number;
  prev?: number;
  totalPages?: number;
}

export interface CollectionResponse<T> {
  readonly data: T[];
  readonly pagination: Pagination;
}
