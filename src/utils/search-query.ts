import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchQuery {
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number;

  @IsString()
  @IsOptional()
  search?: string;

  constructor(page?: number, limit?: number, search?: string) {
    this.page = page ?? 1;
    this.limit = limit ?? 10;
    this.search = search;
  }
}
