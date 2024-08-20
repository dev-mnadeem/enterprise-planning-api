import { Entity, Column, CreateDateColumn, BeforeInsert, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

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

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
