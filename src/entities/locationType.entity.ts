import { Entity, Column, BeforeInsert, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class LocationType {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
