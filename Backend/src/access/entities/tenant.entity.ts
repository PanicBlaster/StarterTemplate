import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('tenants')
export class Tenant {
  @ApiProperty({ description: 'The unique identifier of the tenant' })
  @PrimaryColumn('varchar')
  id: string;

  @ApiProperty({ description: 'The name of the tenant' })
  @Column({ type: 'varchar', unique: true })
  name: string;

  @ApiProperty({ description: 'Optional description of the tenant' })
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ApiProperty({ description: 'Additional notes about the tenant' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Timestamp of when the tenant was created' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the tenant was last updated' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.tenants)
  @JoinTable()
  users: User[];
}
