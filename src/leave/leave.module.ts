import { Module } from "@nestjs/common";
import { LeaveController } from "./leave.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Leave } from "./entities/leave.Entity";
import { LeaveService } from "./leave.service";
import { Employee } from "src/employee/entities/employee.Entity";

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee]),],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
