/**
 * Entity Mapping Service:
 *
 * Encapsulates routines related to mapping data produced from SQL into model entities, as well
 * as low level operations related to manually establishing relations between models.
 *
 * The general process of bulk loading data into memory:
 * 1. load objects that have no fk relations (op code, tank statuc, etc) via fetchAll()
 * type operations
 * 2. Load data for other objects in scope that do have relations (tank, work order, etc.)
 * via raw SQL which is wrappered by table specific interfaces. interfaces will reference
 * relations as underlying fk values.
 * 3. Convert interfaces produced in step 2 into model objects, while manually establishing
 * object relations based on interface fk values and lookups to those entities produced
 * in step 1.
 *
 * Sequencing is important when translating the sql wrappers for data (work order, movement,
 * movement segment), as we need to build the structure from the bottom of the hierarchy up.
 * So, for example, once the 'dictionary data' is loaded via ORM calls, the half legs
 * are built first, then the movements are translated during which the bi-directional
 * relations between movements and movement segments are established, and then finally
 * the work order data is translated, at which time the relationshps for those immediate
 * dependencies are satisfied.
 *
 * While it is true that there is a fiar amount of legwork using this approach, loading the
 * data via raw sgl and then performing the manual translations is a much more efficient approach
 * rather then relying on an ORM layer, which is desireable when dealing with large sets
 * of data.
 */

import MovementSegment from "@/models/movement-segment.model";
import Movement from "@/models/movement.model";
import OperationCode from "@/models/operation-code.model";
import TankStatus from "@/models/tank-status.model";
import TankType from "@/models/tank-type.model";
import Tank from "@/models/tank.model";
import WorkOrder from "@/models/work-order-model";
import WorkOrderStatus from "@/models/work-order-status.model";
import MovementQueryResult from "@/repo/loaders/query-result/movement-query-result";
import MovementSegmentQueryResult from "@/repo/loaders/query-result/movement-segment-query-result";
import TankQueryResult from "@/repo/loaders/query-result/tank-query-result";
import WorkOrderQueryResult from "@/repo/loaders/query-result/work-order-query-result";

/*******************************************************************************************
 * 'Low level' methods for mapping sql interface wrapper classes to model equivelents.
 *******************************************************************************************/

/**
 * Low level translation for attributes for the Tank model, relations are
 * excluded, and it is expected that the calling method establishes them.
 *
 * @param tankIf
 * @returns
 */
export const mapTankInterfaceToModel = (tankIf: TankQueryResult): Tank => {
  let tank = new Tank();

  tank.id = tankIf.id;
  tank.name = tankIf.name;

  return tank;
};

/**
 * Low level translation for attributes for the Work Order model, relations are
 * excluded, and it is expected that the calling method establishes them.
 *
 * @param woIf
 * @returns
 */
export const mapWoInterfaceToModel = (
  woIf: WorkOrderQueryResult
): WorkOrder => {
  let wo = new WorkOrder();

  wo.id = woIf.id;
  wo.workOrderNumber = woIf.work_order_number;
  wo.description = woIf.description;
  wo.notes = woIf.notes;

  wo.createdAt = woIf.created_at;
  wo.updatedAt = woIf.updated_at;
  wo.archivedAt = woIf.archived_at;

  return wo;
};

/**
 * Low level translation for attributes for the Movement model, relations are
 * excluded, and it is expected that the calling method establishes them.
 *
 * @param mvmntIf
 * @returns
 */
export const mapMvmntInterfaceToModel = (
  mvmntIf: MovementQueryResult
): Movement => {
  let mvmnt = new Movement();
  mvmnt.id = mvmntIf.id;
  mvmnt.requestedGallons = mvmntIf.req_gallons;
  return mvmnt;
};

/**
 * Low level translation for attributes for the Movement segment model, relations are
 * excluded, and it is expected that the calling method establishes them.
 *
 * @param mvmntSegIf
 * @returns
 */
export const mapMvmntSgmntInterfaceToModel = (
  mvmntSegIf: MovementSegmentQueryResult
): MovementSegment => {
  let mvmntSeg = new MovementSegment();

  mvmntSeg.id = mvmntSegIf.id;
  mvmntSeg.previousGallons = mvmntSegIf.previous_gallons;
  mvmntSeg.afterGallons = mvmntSegIf.after_gallons;

  return mvmntSeg;
};

/*******************************************************************************************
 * 'High level' mapping operations for collections of sql wrapper interfaces.
 * These operations will not only translate the basic attributes of a given
 * type, but also the relations.
 *******************************************************************************************/
export const mapTankIfsToModels = (
  tankIfs: Array<TankQueryResult>,
  tankStatuses: Map<number, TankStatus>,
  tankTypes: Map<number, TankType>
): Map<number, Tank> => {
  const results: Map<number, Tank> = new Map();

  tankIfs.forEach((tankIf, index) => {
    const tank = mapTankInterfaceToModel(tankIf);
    tank.tankStatus = tankStatuses.get(tankIf.tank_status_id);
    tank.tankType = tankTypes.get(tankIf.tank_type_id);
    results.set(tank.id, tank);
  });

  return results;
};

/**
 * Given a collection of interfaces for work order sql level data, and a set of related model
 * information, convert the interfaces into models, and return a map containing work orders,
 * indexed by work order id. Additionally, the bi-directional relationship between work order
 * and it's movements.
 *
 * The processing of establishing the relations requires some footwork
 *
 *
 * @param woIfs collection of interface wrappers for work order data produced from raw sql
 * @param opCodes map containing opcode dat indexed by id
 * @param statusCodes map containing wo status codes index by id
 * @param mvmnts map containing movements indexed by id
 * @param mvmntIfs an array of sql wrappers for movements (required for establishing relations)
 * @returns
 */
export const mapWorkOrderIfsToModels = (
  woIfs: Array<WorkOrderQueryResult>,
  opCodes: Map<number, OperationCode>,
  statusCodes: Map<number, WorkOrderStatus>,
  mvmnts: Map<number, Movement>,
  mvmntIfs: Array<MovementQueryResult>
): Map<number, WorkOrder> => {
  const results: Map<number, WorkOrder> = new Map();

  woIfs.forEach((woIf, index) => {
    // Perform mapping of basic attributes
    const wo = mapWoInterfaceToModel(woIf);

    // Establish relations to many to one (unidirectional) entities
    wo.operationCode = opCodes.get(woIf.op_code_id);
    wo.workOrderStatus = statusCodes.get(woIf.status_code_id);
    wo.movements = [];

    // Identify which movements are referenced by the current work order in preparation
    // for establishing the many-to-one bi directional relation.
    const mvmntIfRefs: Array<MovementQueryResult> = mvmntIfs.filter(
      (cur: MovementQueryResult) => cur.work_order_id == woIf.id
    );

    const mvmntRefs: Array<Movement> = [];
    let selMvmnt: Movement | undefined;
    mvmntIfRefs.forEach((ref: MovementQueryResult) => {
      selMvmnt = mvmnts.get(ref.id);
      if (selMvmnt) {
        mvmntRefs.push(selMvmnt);
      }
    });

    // Now that we have identified all related movements for the current work order,
    // establish references on both sides of the many-to-one relationship.
    mvmntRefs.forEach((mvmnt: Movement) => {
      mvmnt.workOrder = wo;
      wo.movements?.push(mvmnt);
    });

    results.set(wo.id, wo);
  });

  return results;
};

/**
 * Map sql interface wrappers for movements into a map containing the model equivelents
 * using the id for each as the key. In addition to translating between the two formats, the
 * bi-directional relations between the movement and movement segments are established.
 *
 * @param mvmntIfs
 * @param mvmntSegs
 * @returns
 */
export const mapMovementIfsToModels = (
  mvmntIfs: Array<MovementQueryResult>,
  mvmntSegs: Map<number, MovementSegment>
): Map<number, Movement> => {
  const results: Map<number, Movement> = new Map();

  mvmntIfs.forEach((mvmntIf, index) => {
    const mvmnt = mapMvmntInterfaceToModel(mvmntIf);
    //mvmnt.workOrder = wos.get(mvmntIf.work_order_id);
    mvmnt.source = mvmntSegs.get(mvmntIf.src_segment_id);
    mvmnt.dest = mvmntSegs.get(mvmntIf.dest_segment_id);
    results.set(mvmnt.id, mvmnt);
  });

  return results;
};

/**
 * Translate sql movement segment data into the model equivelents. Relations
 * to the tank dependency will be established, however the reference to the
 * parent movement will not be establised. See file level comments for an overview
 * of the mapping process.
 *
 * Relations between movement sequences are also established.
 *
 * @param mvmntSegIfs
 * @param tanks
 * @returns Map containing movement segment data using the id as a key.
 */
export const mapMovementSegmentIfsToModels = (
  mvmntSegIfs: Array<MovementSegmentQueryResult>,
  tanks: Map<number, Tank>
): Map<number, MovementSegment> => {
  const results: Map<number, MovementSegment> = new Map();

  mvmntSegIfs.forEach((mvmntSegIf, index) => {
    const mvmntSeg = mapMvmntSgmntInterfaceToModel(mvmntSegIf);
    mvmntSeg.tank = tanks.get(mvmntSegIf.tank_id);
    results.set(mvmntSeg.id, mvmntSeg);
  });

  // Map internal relations between movement segments
  let curMvmntSeg, mvmntSegRef: MovementSegment | undefined;
  mvmntSegIfs.forEach((mvmntSegIf, index) => {
    if (mvmntSegIf.prev_mvmnt_seg_id != null) {
      mvmntSegRef = results.get(mvmntSegIf.prev_mvmnt_seg_id);
      curMvmntSeg = results.get(mvmntSegIf.id);
      if (curMvmntSeg) {
        curMvmntSeg.prevMvmnt = mvmntSegRef;
      }
    }
    if (mvmntSegIf.next_mvmnt_seg_id != null) {
      mvmntSegRef = results.get(mvmntSegIf.next_mvmnt_seg_id);
      curMvmntSeg = results.get(mvmntSegIf.id);
      if (curMvmntSeg) {
        curMvmntSeg.nextMvmnt = mvmntSegRef;
      }
    }
  });

  return results;
};

/**
 * Once we have translated all movement segments from their sql interface
 * representations into the object representations, we have enough information
 * to establish 'previous' and 'next' relations, for which this method is
 * responsible. These relations allow us to traverse activity for chains
 * of operations.
 *
 * Keep in mind, not every half leg will have previous and next relations.
 * For example, in the event that a movement segment is the 'last recorded thing'
 * to happen, then we would have no 'next' segment to reference, as it does not exist.
 *
 * @param movementSegments
 * @param sqlRefs
 */
export const establishMovementSegmentInternalReferences = (
  movementSegments: Map<number, MovementSegment>,
  sqlRefs: Array<MovementSegmentQueryResult>
) => {
  // Create a fast lookup structure to located
  const ifMap: Map<number, MovementSegmentQueryResult> = new Map();
  sqlRefs.forEach((ref) => {
    ifMap.set(ref.id, ref);
  });

  let nextMvmnt, prevMvmnt;
  let curSegIF: MovementSegmentQueryResult | undefined;
  movementSegments.forEach((curSeg: MovementSegment, key: number) => {
    let segIdRef: number;

    // Locate sql iterface for current segment
    curSegIF = ifMap.get(curSeg.id);
    if (!curSegIF) {
      throw new Error(
        "Unable to located referenced segment, a complete set of records needs to be provided to this method."
      );
    }

    // Establish 'previous' reference (if any)
    if (curSegIF.prev_mvmnt_seg_id) {
      curSeg.prevMvmnt = movementSegments.get(curSegIF.prev_mvmnt_seg_id);
    }

    // And also the 'next' reference if it exists
    if (curSegIF.next_mvmnt_seg_id) {
      curSeg.nextMvmnt = movementSegments.get(curSegIF.next_mvmnt_seg_id);
    }
  });
};

/**
 * Given a set of data from a raw SQL query (more or less), convert the data into
 * work order class instances. Note, this is an 'select * from work_order' type operation,
 * whereas additional operation needs to be performed to populate any defined assocations.
 *
 * @returns
 */
const converRawDataToWorkOrders = (
  rawRecords: Array<WorkOrderQueryResult>,
  woStatusCodes: Map<number, WorkOrderStatus>,
  operationCodes: Map<number, OperationCode>
): Array<WorkOrder> => {
  const results: Array<WorkOrder> = [];
  let curWo: WorkOrder;

  rawRecords.forEach((curRec: WorkOrderQueryResult) => {
    curWo = new WorkOrder();

    curWo.id = curRec.id;
    curWo.workOrderNumber = curRec.work_order_number;
    curWo.description = curRec.description;
    curWo.notes = curRec.notes;

    curWo.createdAt = curRec.created_at;
    curWo.updatedAt = curRec.updated_at;
    curWo.archivedAt = curRec.archived_at;

    curWo.workOrderStatus = woStatusCodes.get(curRec.status_code_id);
    curWo.operationCode = operationCodes.get(curRec.op_code_id);

    results.push(curWo);
  });

  return results;
};

export const setNextRef = (
  id: number,
  nextId: number,
  mvmntSegDefMap: Map<number, MovementSegment>
) => {
  const ref = mvmntSegDefMap.get(id);
  if (!ref) {
    return;
  }
  const nextRef = mvmntSegDefMap.get(nextId);
  if (!nextRef) {
    return;
  }
  ref.nextMvmnt = nextRef;
};

export const setPrevRef = (
  id: number,
  prevId: number,
  mvmntSegDefMap: Map<number, MovementSegment>
) => {
  const ref = mvmntSegDefMap.get(id);
  if (!ref) {
    return;
  }
  const prevRef = mvmntSegDefMap.get(prevId);
  if (!prevRef) {
    return;
  }
  ref.prevMvmnt = prevRef;
};
