import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseInterface } from '../interfaces/paginated-response.interface';

export function createSwaggerPaginatedResponseDto<T>(ItemDto: new (...args: any[]) => T): new (...args: any[]) => PaginatedResponseInterface<T> {
  class PaginatedResponseForSwagger implements PaginatedResponseInterface<T> {
    @ApiProperty({ type: [ItemDto], description: 'Array de itens paginados' })
    data: T[];

    @ApiProperty({ type: Number, description: 'Número total de itens' })
    total: number;

    @ApiProperty({ type: Number, description: 'Número da página atual' })
    page: number;

    @ApiProperty({ type: Number, description: 'Número de itens por página' })
    size: number;
  }

  Object.defineProperty(PaginatedResponseForSwagger, 'name', {
    value: `Paginated${ItemDto.name}Response`,
  });

  return PaginatedResponseForSwagger;
}
