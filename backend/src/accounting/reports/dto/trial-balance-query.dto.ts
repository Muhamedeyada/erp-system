import { IsDateString, IsOptional } from 'class-validator';

export class TrialBalanceQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
