import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn
} from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class Currency {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  currency_name: string;

  @Column()
  default: boolean;

  @Column()
  symbol: string;

  @Column()
  code: string;

  @Column()
  exchange_rate: number;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
