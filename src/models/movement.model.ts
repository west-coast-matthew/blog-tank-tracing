/**
 *
 * Movement Model:
 *
 * Represents an individual operation which a work order consists of. Every work
 * order has at least movement, may may consist of many.
 */

import MovementSegment from "@/models/movement-segment.model";
import WorkOrder from "@/models/work-order-model";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export default class Movement {
  /****************************************************************************************
   * Core attributes
   ****************************************************************************************/
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Number of gallons requested by the user, this might actually vary from the end resulting
   * gallons.
   */
  @Column({ type: "int", name: "req_gallons", default: 0 })
  requestedGallons: number;

  /****************************************************************************************
   * Relations
   ****************************************************************************************/
  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.movements) // Many posts belong to one user
  @JoinColumn({ name: "work_order_id", referencedColumnName: "id" })
  workOrder?: WorkOrder;

  @OneToOne(() => MovementSegment)
  @JoinColumn({ name: "src_segment_id" })
  source: MovementSegment;

  @OneToOne(() => MovementSegment)
  @JoinColumn({ name: "dest_segment_id" })
  dest: MovementSegment;

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
   * Convenience method for determining if a movement actually involves a physical transfer
   * of content between two points. For some operations, such as pasurization or a subsequent
   * cooling operation, the content remains in the same physical container. A common check
   * while applying business logic is determine if there was aphysical transfer, so we provide
   * this convenience method here, and encapsulate/centralize the logic here.
   *
   * @returns
   */
  public isActualMovement(): boolean {
    if (!this.source) {
      throw Error(
        `'source tank' reference 'must' be defined before calling 'isActualMovement' method`
      );
    }

    if (!this.dest) {
      throw Error(
        `'dest tank' reference 'must' be defined before calling 'isActualMovement' method`
      );
    }

    return this.source?.tank?.id !== this.dest?.tank?.id;
  }

  public isMovementOutbound(tankId: number): boolean {
    return this.source?.tank?.id == tankId;
  }
}
