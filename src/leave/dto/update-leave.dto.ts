import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave.dto';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { LeaveType } from './create-leave.dto';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
