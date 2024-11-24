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
  q?: string;

  constructor(page?: number, limit?: number, q?: string) {
    this.page = page ?? 1;
    this.limit = limit ?? 10;
    this.q = q;
  }
}
