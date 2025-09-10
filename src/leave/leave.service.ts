import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Leave } from "./entities/leave.Entity";
import { Employee } from "src/employee/entities/employee.Entity";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveDto } from "./dto/update-leave.dto";

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>
  ) {}

  async create(dto: CreateLeaveDto) {
    const employee = await this.empRepo.findOneBy({ id: dto.employeeId });
    if (!employee) throw new BadRequestException("Employee not found");
  
    const start = moment(dto.startDate, "YYYY-MM-DD", true);
    const end = moment(dto.endDate, "YYYY-MM-DD", true);

    if (!start.isValid() || !end.isValid()) {
      throw new BadRequestException(
        "Tanggal tidak valid, gunakan format YYYY-MM-DD"
      );
    }

    if (!start.isSameOrBefore(end)) {
      throw new BadRequestException(
        "start_date must be before or equal end_date"
      );
    }
  
    const days = end.diff(start, "days") + 1;
  
    // Check total year
    const year = start.year();
    const yearStart = moment([year, 0, 1]).format("YYYY-MM-DD");
    const yearEnd = moment([year, 11, 31]).format("YYYY-MM-DD");
  
    const existingYearLeaves = await this.leaveRepo
      .createQueryBuilder("l")
      .where("l.employee_id = :id", { id: dto.employeeId })
      .andWhere(
        "(l.start_date BETWEEN :ys AND :ye OR l.end_date BETWEEN :ys AND :ye)",
        { ys: yearStart, ye: yearEnd }
      )
      .getMany();
  
    let usedDays = 0;
    for (const l of existingYearLeaves) {
      const s = moment(l.startDate);
      const e = moment(l.endDate);
      const ss = s.isBefore(yearStart) ? moment(yearStart) : s;
      const ee = e.isAfter(yearEnd) ? moment(yearEnd) : e;
      usedDays += ee.diff(ss, "days") + 1;
    }
  
    if (usedDays + days > 12) {
      throw new BadRequestException("Melebihi jatah 12 hari per tahun");
    }

    // Check only 1 day per month
    const months: { year: number; month: number }[] = [];
    let cursor = start.clone();
    while (cursor.isSameOrBefore(end)) {
      months.push({ year: cursor.year(), month: cursor.month() + 1 });
      cursor = cursor.add(1, "day");
    }

    for (const m of months) {
      const monthStart = moment(
        `${m.year}-${String(m.month).padStart(2, "0")}-01`
      );
      const monthEnd = monthStart.clone().endOf("month");

      // Get all leave in this month
      const existing = await this.leaveRepo
        .createQueryBuilder("l")
        .where("l.employee_id = :id", { id: dto.employeeId })
        .andWhere("l.start_date BETWEEN :ms AND :me", {
          ms: monthStart.format("YYYY-MM-DD"),
          me: monthEnd.format("YYYY-MM-DD"),
        })
        .getMany();

      // Calculate total leave in this month
      let existingDays = 0;
      for (const l of existing) {
        const s = moment(l.startDate);
        const e = moment(l.endDate);
        const ss = s.isBefore(monthStart) ? monthStart : s;
        const ee = e.isAfter(monthEnd) ? monthEnd : e;
        existingDays += ee.diff(ss, "days") + 1;
      }

      const reqStart = moment.max(start, monthStart);
      const reqEnd = moment.min(end, monthEnd);
      const reqDays = reqEnd.diff(reqStart, "days") + 1;

      if (reqDays > 1) {
        throw new BadRequestException(
          "Tidak boleh mengambil lebih dari 1 hari dalam bulan yang sama"
        );
      }

      if (existingDays + reqDays > 1) {
        throw new BadRequestException(
          `Anda sudah mengambil ${existingDays} hari cuti pada bulan ${m.month} (${m.year}), maksimal 1 hari per bulan`
        );
      }
    }
  
    const leave = this.leaveRepo.create({
      employee,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      days,
    });
  
    return this.leaveRepo.save(leave);
  }

  async findAll() {
    return this.leaveRepo.find({ relations: ['employee'] });
  }

  async findOne(id: number) {
    const leave = await this.leaveRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async update(id: number, dto: UpdateLeaveDto) {
    const leave = await this.leaveRepo.findOne({ where: { id }, relations: ['employee'] });
    if (!leave) throw new NotFoundException('Leave not found');

    // gunakan nilai lama jika dto tidak diisi
    const startDate = dto.startDate ? moment(dto.startDate) : moment(leave.startDate);
    const endDate = dto.endDate ? moment(dto.endDate) : moment(leave.endDate);
    const leaveType = dto.leaveType ?? leave.leaveType;
    const reason = dto.reason ?? leave.reason;

    // delete sementara leave lama untuk validasi
    await this.leaveRepo.delete(id);

    // validasi rules sama seperti create
    await this.create({
      employeeId: leave.employee.id,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      leaveType,
      reason,
    });

    // ambil data baru
    return this.leaveRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
  }

  async remove(id: number) {
    const leave = await this.leaveRepo.findOneBy({ id });
    if (!leave) throw new NotFoundException('Leave not found');
    return this.leaveRepo.remove(leave);
  }
}
