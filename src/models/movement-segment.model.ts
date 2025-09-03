/**
 * Movement Segment Model:
 *
 * Represents a side if a movement. Each movement has a reference
 * (MovementSegment) from the origin of the operation and one
 * representing the destination.
 *
 * Relations between the movement segment entity are established between the
 * 'prevMvmnt' and 'nextMvmnt' entities. These are essiential to tracing low
 * level details of operations to establish a sequence of historical actions.
 *
 *
 *
 *
 */

import Movement from "@/models/movement.model";
import Tank from "@/models/tank.model";
import WorkOrder from "@/models/work-order-model";
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
export default class MovementSegment {
  /****************************************************************************************
   * Core attributes
   ****************************************************************************************/
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Tank level prior to operation.
   */
  @Column({ type: "int", name: "before_gallons", default: 0 })
  previousGallons: number;

  /**
   * Tank level after operation completion.
   */
  @Column({ type: "int", name: "after_gallons", default: 0 })
  afterGallons: number;

  /****************************************************************************************
   * Relations
   ****************************************************************************************/
  @ManyToOne(() => Movement)
  @JoinColumn({ name: "movement_id" })
  movement: Movement;

  @ManyToOne(() => Tank) // Unidirectional ManyToOne association
  @JoinColumn({ name: "tank_id" }) // Specifies the foreign key column name
  tank: Tank;

  /* Reference to the 'previous' thing that happend for the tank associated with this half of the transaction. This really would 'never' be null unless this is a 'brand new' tank where no activity has ever been recorded.
   */
  @JoinColumn({ name: "prev_mvmnt_seg_id" })
  prevMvmnt?: MovementSegment;

  /* And also reference to the next activity, which would only be null in the case that the event represented in this object is the 'most recent thing' that has happend. */
  @JoinColumn({ name: "next_mvmnt_seg_id" })
  nextMvmnt?: MovementSegment;

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

  isPreviousOperationInbound = (): boolean => {
    if (!this.tank) {
      throw Error("Cannot perform operation if no tank is defined");
    }

    if (!this.prevMvmnt) {
      throw Error(
        "Cannot perform operation if no previous movment segment reference is not defined"
      );
    }

    if (!this.prevMvmnt.tank) {
      throw Error(
        "Cannot perform operation if no tank is defined for previous movment segment reference is not defined"
      );
    }

    if (this.prevMvmnt?.tank.id == this.tank.id) {
      return true;
    }

    return false;
  };

  isNextMovementInbound = (): boolean => {
    if (!this.tank) {
      throw Error("Cannot perform operation if no tank is defined");
    }

    if (!this.nextMvmnt) {
      throw Error(
        "Cannot perform operation if no next movment segment reference is not defined"
      );
    }

    if (!this.nextMvmnt.tank) {
      throw Error(
        "Cannot perform operation if no tank  defined for next movment segment reference is not defined"
      );
    }

    if (this.nextMvmnt?.tank.id == this.tank.id) {
      return true;
    }

    return this.tank.id != this.nextMvmnt.id;
  };

  wasPreviousOperationAMovement = (): boolean => {
    if (!this.tank) {
      throw Error("Cannot perform operation if no tank is defined");
    }

    if (!this.prevMvmnt) {
      throw Error(
        "Cannot perform operation if no previous movment segment reference is not defined"
      );
    }

    if (!this.prevMvmnt.tank) {
      throw Error(
        "Cannot perform operation if no previous movment segment reference has not tank definition"
      );
    }

    return this.tank.id != this.prevMvmnt.id;
  };

  wasNextOperationAMovement = (): boolean => {
    if (!this.tank) {
      throw Error("Cannot perform operation if no tank is defined");
    }

    if (!this.nextMvmnt) {
      throw Error(
        "Cannot perform operation if no next movment segment reference is not defined"
      );
    }

    if (!this.nextMvmnt.tank) {
      throw Error(
        "Cannot perform operation if no previous movment segment reference has not tank definition"
      );
    }

    return this.tank.id != this.nextMvmnt.id;
  };
}
