import { Leave } from "src/leave/entities/leave.Entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn() 
  id: number;

  @OneToMany(() => Leave, (leave) => leave.employee, { cascade: true })
  leave: Leave[];

  @Column() 
  first_name: string;

  @Column({ nullable: true }) 
  last_name: string;

  @Column({ unique: true }) 
  email: string;

  @Column({ nullable: true }) 
  phone: string;

  @Column({ type: "text", nullable: true }) 
  address: string;
  
  @Column({ type: "enum", enum: ["male", "female", "other"], default: "other" })
  gender: string;

  @Column() 
  password: string;

  @CreateDateColumn() 
  created_at: Date;

  @UpdateDateColumn() 
  updated_at: Date;
}
