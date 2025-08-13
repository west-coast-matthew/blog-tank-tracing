/**
 * Tank Model:
 *
 * Represents a piece of equipment that contains base product,
 * so this could be a storage tank or a filter, etc. Regardless
 * of the type of equipment, is 'contains' product, so we generically
 * refer to each as a 'tank', and the 'tank type' attribute allows
 * you to define the actual nature of the actual piece of equipment.
 *
 */
import TankStatus from "@/models/tank-status.model";
import TankType from "@/models/tank-type.model";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export default class Tank {
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
  @ManyToOne(() => TankStatus) // Define the ManyToOne relation to User
  @JoinColumn({ name: "tank_status_id" })
  tankStatus?: TankStatus;

  @ManyToOne(() => TankType) // Define the ManyToOne relation to User
  @JoinColumn({ name: "tank_type_id" })
  tankType?: TankType;

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
}
