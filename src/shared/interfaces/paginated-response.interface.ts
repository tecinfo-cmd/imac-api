export interface PaginatedResponseInterface<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}
