import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { ulid } from 'ulid';
import { Pricing } from './pricing.entity';

@Entity()
export class Package {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['road', 'air', 'sea'],
    default: 'road',
  })
  route: string;

  @Column({
    type: 'enum',
    enum: ['lbs', 'kg', 'cbm'],
    default: 'kg',
  })
  weight_type: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  height: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  depth: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight_limit: number;

  @OneToMany(() => Pricing, (pricing) => pricing.package)
  pricing: Pricing[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
