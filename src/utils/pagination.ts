export class Pagination<T> {
  constructor(
    public readonly data: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
