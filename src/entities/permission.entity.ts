import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class Permission {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'json', nullable: false, default: { add: true, view: true, update: true, remove: true } })
  properties: JSON;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
