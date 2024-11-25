import { IsOptional, IsString } from 'class-validator';
import { SearchQuery } from 'src/utils/search-query';

export class ProductQuery extends SearchQuery {
  @IsOptional()
  @IsString()
  category?: string;

  constructor(page: number, limit: number, q: string, category?: string) {
    super(page, limit, q);

    this.category = category;
  }
}
