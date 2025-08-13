/**
 * Operation Code Model:
 *
 * Represents a classification of an operation. Each work order contains a series
 * of one or more operations, sharing a common nature such as moving things between
 * different locations, cooling something, pasturizing or filtering product base.
 *
 * It is important to classify and track operations using this entity as various
 * business logic is applied based on any given operation type.
 *
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity()
export default class OperationCode {
  /****************************************************************************************
   * Core attributes
   ****************************************************************************************/
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: "name", nullable: false, length: 25 })
  name: string;

  @Column({ type: "varchar", name: "description", nullable: true, length: 100 })
  description?: string;

  /****************************************************************************************
   * Relations
   ****************************************************************************************/

  /****************************************************************************************
   * Timestamp tracking
   ****************************************************************************************/
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

  /****************************************************************************************
   * Convenience methods
   ****************************************************************************************/
  /**
   * Used to determine if the nature of the operation involves extraction of
   * juice from the raw material (oranges). Internalizes the logic required to
   * identify these operations rather than
   */
  public isExtractionOperation(): boolean {
    //todo: implement check

    return false;
  }
}
