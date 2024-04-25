import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn
} from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class DeliveryTiming {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  title: string;

  @Column()
  hours: string;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
