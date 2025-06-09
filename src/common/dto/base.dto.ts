import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'Unique identifier of the resource',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Date and time when the resource was created',
  })
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    description: 'Date and time when the resource was last updated',
  })
  @IsOptional()
  updatedAt?: Date;
}
