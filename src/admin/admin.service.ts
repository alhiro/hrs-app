import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.Entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private repo: Repository<Admin>,
    private readonly employeeService: EmployeeService,
  ) {}

  async create(dto: CreateAdminDto) {
    const exist = await this.repo.findOne({ where: { email: dto.email } });
    if (exist) throw new BadRequestException('Email already registered');

    const admin = this.repo.create(dto);
    return this.repo.save(admin);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const admin = await this.repo.findOneBy({ id });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async update(id: number, dto: UpdateAdminDto) {
    const admin = await this.findOne(id);
    console.log(admin)
    Object.assign(admin, dto);
    return this.repo.save(admin);
  }

  async remove(id: number) {
    const admin = await this.findOne(id);
    return this.repo.remove(admin);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
