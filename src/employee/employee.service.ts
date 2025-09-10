import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.Entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private repo: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException("Email already registered");
    }

    const plainPassowrd = dto.password.trim();
    const hashedPassword = await bcrypt.hash(plainPassowrd, 10);

    const user = this.repo.create({
      ...dto,
      password: hashedPassword,
    });

    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const employee = await this.repo.findOneBy({ id });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    Object.assign(employee, dto);
    return this.repo.save(employee);
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    return this.repo.remove(employee);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
