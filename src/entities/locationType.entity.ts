import { Entity, Column, BeforeInsert, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ulid } from 'ulid';
import { Location } from './location.entity';

@Entity()
export class LocationType {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Location, location => location.location_type)
  locations: Location[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
