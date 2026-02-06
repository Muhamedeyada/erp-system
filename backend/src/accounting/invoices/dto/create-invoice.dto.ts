import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceLineDto } from './invoice-line.dto';

export class CreateInvoiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  customerName!: string;

  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsDateString()
  date!: string;

  @IsDateString()
  dueDate!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one line item required' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines!: InvoiceLineDto[];
}
