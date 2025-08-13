/**
 * Work Order Model:
 *
 * Representation of a type of work to be performed, basically we tracking
 * a unit of work. The nature of the work is defined by the associated
 * operation code. At least a single activity needs to occur within the
 * scope of an work order. All operations are represented as 'movements',
 * where the relation between a work order and the associated movements
 * is a bi-directional one to many relation.
 *
 * The operations performed may or may not involve a physical movement,
 * or transfer of content btween two pieces of equipment. For those operations
 * that to involve the physical transfer of content, one or multiple movements
 * may be assigned to a common work order. In these cases, the rules for
 * assigning movements involve moving content from one place to multiple
 * destinations (one-to-many) or from multiple sources to a common destination
 * (many-to-one). In order to determine if the operation was an actual
 * movement and the nature of the movement, convenience methods are provided
 * AND SHOULD BE USED when executing business logic, as this provides a centralized
 * consistent place for these checks to occur, and promote a cleaner service
 * lovel logic.
 *
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Movement from "@/models/movement.model";
import OperationCode from "@/models/operation-code.model";
import WorkOrderStatus from "@/models/work-order-status.model";

@Entity()
export default class WorkOrder {
  /****************************************************************************************
   * Core attributes
   ****************************************************************************************/

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    name: "work_order_number",
    nullable: true,
    length: 100,
  })
  workOrderNumber?: string;

  @Column({ type: "varchar", name: "description", nullable: true, length: 100 })
  description?: string;

  @Column({ type: "varchar", name: "notes", nullable: true, length: 100 })
  notes?: string;

  @Column({
    type: "varchar",
    name: "scheduled_start",
    nullable: true,
    length: 100,
  })
  scheduledStart: Date;

  @Column({
    type: "varchar",
    name: "scheduled_end",
    nullable: true,
    length: 100,
  })
  scheduledEnd: Date;

  @Column({
    type: "varchar",
    name: "actual_start",
    nullable: true,
    length: 100,
  })
  actualStart: Date;

  /****************************************************************************************
   * Timestamp tracking
   ****************************************************************************************/

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public createdAt?: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  public updatedAt?: Date;

  @DeleteDateColumn()
  archivedAt?: Date;

  /****************************************************************************************
   * Relations
   ****************************************************************************************/
  @OneToMany(() => Movement, (movement) => movement.workOrder)
  movements?: Movement[];

  @ManyToOne(() => OperationCode) // Define the ManyToOne relation to User
  @JoinColumn({ name: "op_code_id" })
  operationCode?: OperationCode | undefined;

  @ManyToOne(() => OperationCode) // Define the ManyToOne relation to User
  @JoinColumn({ name: "wo_status_code_id" })
  workOrderStatus?: WorkOrderStatus | undefined;

  /****************************************************************************************
   * Convenience methods
   ****************************************************************************************/

  /**
   *
   * @returns
   */
  isManyToOneOperation = (): boolean => {
    if (!this.movements || this.movements.length == 0) {
      return false;
    }

    return true;
  };

  /**
   *
   * @returns
   */
  isOneToManyOperation = (): boolean => {
    if (!this.movements || this.movements.length == 0) {
      return false;
    }

    return true;
  };

  /**
   * Not all operations involve physical movements. For example,
   * pasturization is perform as an operation after content is transfered
   * into that piece of equipment in a dedicated wo, and the trasfer
   * out is recorded as a separate implementation.
   *
   * @returns
   */
  didActualMovementOccur = (): boolean => {
    if (!this.movements || this.movements.length == 0) {
      return false;
    }
    // todo: implement
    return true;
  };

  /**
   * Determine if any movemeents have been defined.
   *
   * @returns
   */
  hasOperationsAssigned = (): boolean => {
    if (!this.movements || this.movements.length == 0) {
      return false;
    }

    // todo: implement
    return true;
  };

  /**
   * Determine if the work order has been reviewed and signed off by
   * an compliance role.
   */
  isValidated = (): boolean => {
    if (!this.operationCode) {
      return false;
    }

    const OP_CODE_NAME_VALIDATED = "Validated";

    return this.operationCode.name == "Validated";
  };
}
