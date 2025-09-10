import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmployeeService } from '../employee/employee.service';
import { AdminService } from '../admin/admin.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface UserPayload {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  birth_date?: string;
  gender: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.adminService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _pwd, ...result } = user;
    return result;
    }

  async login(user: UserPayload) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.adminService.findByEmail(registerDto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const plainPassowrd = registerDto.password.trim();
    const hashedPassword = await bcrypt.hash(plainPassowrd, 10);

    const admin = await this.adminService.create({
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      email: registerDto.email,
      gender: registerDto.gender,
      password: hashedPassword,
      role: registerDto.role
    });

    return { message: 'Admin registered successfully', admin };
  }

}
