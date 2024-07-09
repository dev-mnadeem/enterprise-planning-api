import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ulid } from 'ulid';
import { City } from './city.entity';
import { Package } from './package.entity';

@Entity()
export class Pricing {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  from_city_id: string;

  @Column('varchar', { length: 26 })
  to_city_id: string;

  @Column('varchar', { length: 26, nullable: true })
  package_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => City, (city) => city.from_pricing)
  @JoinColumn({ name: 'from_city_id' })
  from_city: City;

  @ManyToOne(() => City, (city) => city.to_pricing)
  @JoinColumn({ name: 'to_city_id' })
  to_city: City;

  @ManyToOne(() => Package, (pkg) => pkg.pricing)
  @JoinColumn({ name: 'package_id' })
  package: City;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
