import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class UserRole {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
