import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  result: T;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  timestamp: string;
}
