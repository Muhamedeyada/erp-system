import { IsInt, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class InvoiceLineDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
