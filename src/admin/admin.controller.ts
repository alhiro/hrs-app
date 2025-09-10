import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
import { EmployeeService } from 'src/employee/employee.service';

@Controller("admins")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly employeeService: EmployeeService,
  ) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Admin id not found in token');
  
    return this.adminService.findOne(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateProfile(@Req() req: any, @Body() updateAdminDto: UpdateAdminDto) {
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }
    return this.adminService.update(req.user.id, updateAdminDto);
  }

  @Get('list')
  findAll() {
    return this.adminService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminService.remove(+id);
  }

  // update employee by admin
  @UseGuards(JwtAuthGuard)
  @Patch("user/:id")
  async updateUserByAdmin(@Param("id", ParseIntPipe) id: number, @Body() updateAdminDto: UpdateAdminDto) {
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }
    return this.employeeService.update(id, updateAdminDto);
  }

}
