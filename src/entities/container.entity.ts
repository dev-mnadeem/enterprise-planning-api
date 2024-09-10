import { Entity, Column, CreateDateColumn, BeforeInsert, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Country } from './country.entity';

@Entity()
export class Container {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  from_country_id: string;

  @Column('varchar', { length: 26 })
  to_country_id: string;

  @Column()
  tracking_number: string;

  @Column({ nullable: true })
  universal_number: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  height: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  depth: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  volume: number;

  @Column({ type: 'enum', enum: ['cbm'], default: 'cbm' })
  volume_unit: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Country, (country) => country.from_containers)
  @JoinColumn({ name: 'from_country_id' })
  from_country: Country;

  @ManyToOne(() => Country, (country) => country.to_containers)
  @JoinColumn({ name: 'to_country_id' })
  to_country: Country;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
