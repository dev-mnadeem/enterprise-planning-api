import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ulid } from 'ulid';
import { City } from './city.entity';
import { Package } from './package.entity';

@Entity()
@Index(["from_city_id", "to_city_id", "package_id", "route"], { unique: true })
export class Pricing {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  from_city_id: string;

  @Column('varchar', { length: 26 })
  to_city_id: string;

  @Column('varchar', { length: 26 })
  package_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['road', 'air', 'sea'],
    default: 'road',
  })
  route: string;

  @ManyToOne(() => City, (city) => city.from_pricing)
  @JoinColumn({ name: 'from_city_id' })
  from_city: City;

  @ManyToOne(() => City, (city) => city.to_pricing)
  @JoinColumn({ name: 'to_city_id' })
  to_city: City;

  @ManyToOne(() => Package, (pkg) => pkg.pricing)
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
