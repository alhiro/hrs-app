import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn() id: number;

  @Column() first_name: string;
  @Column({ nullable: true }) last_name: string;
  @Column({ unique: true }) email: string;
  @Column({ type: 'date', nullable: true }) birth_date: string;
  @Column({ type: 'enum', enum: ['male', 'female', 'other'], default: 'other' })
  gender: string;
  @Column() password: string;
  @Column({ type: 'enum', enum: ['admin', 'employee'], default: 'employee' }) role: string;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
