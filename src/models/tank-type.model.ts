/**
 * Tank Type Model:
 *
 * Classifier for a tank (is is storage, a filter, pasurization, etc.)
 */
import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity()
export default class TankType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: "name", nullable: false, length: 25 })
  name: string;

  @Column({ type: "varchar", name: "description", nullable: true, length: 100 })
  description?: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at?: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  public updated_at?: Date;

  @DeleteDateColumn()
  archivedAt?: Date;
}
