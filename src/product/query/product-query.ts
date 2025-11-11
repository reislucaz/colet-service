import { IsOptional, IsString } from 'class-validator';
import { SearchQuery } from 'src/utils/search-query';

export class ProductQuery extends SearchQuery {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  constructor(
    page: number,
    limit: number,
    search: string,
    category?: string,
    userId?: string,
  ) {
    super(page, limit, search);

    this.category = category;
    this.userId = userId;
  }
}
