/**
 * Inventory Tracking Service
 *
 * Tank activity is loaded into memory in order to support operations such as viewing
 * hitorical activity for a given tank at a given point in time, tracing transactions, etc.
 *
 * We store all data in memory for fast operations.
 *
 * Note that we perform bulk loading, table by table, and establish the relations in
 * memory as this is more efficient then delgating this to the orm layer.
 *
 */

import MovementSegment from "@/models/movement-segment.model";
import Movement from "@/models/movement.model";
import OperationCode from "@/models/operation-code.model";
import TankStatus from "@/models/tank-status.model";
import TankType from "@/models/tank-type.model";
import Tank from "@/models/tank.model";
import WorkOrder from "@/models/work-order-model";
import WorkOrderStatus from "@/models/work-order-status.model";
import { loadAllRawWoData } from "@/repo/loaders/work-order-loader";
import WorkOrderQueryResult from "@/repo/loaders/query-result/work-order-query-result";
import { getAllOperationCodes } from "@/repo/op-code-repo";
import { getAllTankStatuses } from "@/repo/tank-status-repo";
import { getAllTankTypes } from "@/repo/tank-type-repo";
import { getAllWoStatusCodes } from "@/repo/wo-status-code-repo";
import { resourceLimits } from "worker_threads";
import { MovementSumary } from "@/vo/movement-summary";
import {
  ActivityModel,
  loadActivityGraph,
} from "@/services/entity-load-service";

// Ensure that all data is loaded into memory prior to servicing any requests!
let initialized: boolean = false;

// Holders for data required for building the in memory store
let operationCodes: Map<number, OperationCode> = new Map();
let woStatusCodes: Map<number, WorkOrderStatus> = new Map();
let tankStatuses: Map<number, TankStatus> = new Map();
let tankTypes: Map<number, TankType> = new Map();

//let tanks:Map<number, Tank> = new Map();
//let workOrders:Map<number, WorkOrder> = new Map();
//let movements:Map<number, Movement> = new Map();
//let movementSegments:Map<number, MovementSegment> = new Map();

/**
 * Main store for in memory activity.
 */
let activityModel: ActivityModel | null = null;
export const getInMemoryStore = (): ActivityModel | null => {
  if (!initialized) {
    throw new Error(
      `You must first call the 'initInMemoryStructure' method prior to any operations....`
    );
  }
  return activityModel;
};

/**
 * Load all relevant data into memory, this should be called before any operations may
 * be performed. Next, relations are populated in memory in order to
 */
export const initInMemoryStructure = async () => {
  activityModel = loadActivityGraph();

  // Finally, let the world know we are ready for business!
  initialized = true;
};

/**
 * Given a reference to what had happened in some previus point in history
 * and a tank that we are concearned with tracing activity for, create an
 * series of denormalized value objects representing all activity (think linked
 * list) for easy consumption of the entire related chain of events.
 *
 * The referenced movement represents a point in history, and this method
 * will locate the first movement in the historical sequence, and track
 * every movement after that which falls into the scope of all operations.
 *
 * The process of locating the first movement is referred to as 'backwards
 * tracing' and the process of starting from the initial movement
 * up until the last recorded ovement is referred to as 'forward tracing'.
 *
 * @param mvmntId Reference to a historical point in time when 'something' happened.
 * @param tankId
 *
 * @returns
 */
export const getMovementSequence = (
  mvmntId: number,
  tankId: number
): Array<MovementSumary> => {
  console.log(mvmntId);
  console.log(tankId);

  // locate the movement sequence associated with the movment and reference
  // tank
  const selMvmnt = activityModel?.mvmntsMap.get(mvmntId);

  if (!selMvmnt) {
    throw Error(`Unable to located selected movement for id '${mvmntId}'`);
  }

  // Perform 'backwards tracing' until we locate the 'first' movement
  // in the historical sequence.
  const initialMovement = traceBackwards(tankId, selMvmnt);

  // Now we perform 'forward tracing' until we find the final movement
  // which is the actual point in time when the tank empties, or simply
  // the last recorded movement.

  return [];
};

/**
 * Perform 'backwards tracing':
 *
 * Operation is performed in a recursive fashion until the initial
 * movement is identified.
 *
 **/
export const traceBackwards = (
  tankId: number,
  mvmntRef?: Movement | undefined
): Movement => {
  if (!mvmntRef || mvmntRef == undefined) {
    throw Error(`Method must accept a value for the 'movement' argument`);
  }

  // So if the referenced movement did not actually involve a physical
  // transfer (which would be the case in a cooling operation), then
  // we look at the 'source' side of the movement.
  if (!mvmntRef.isActualMovement()) {
    // If there is nothing more to trace, then the referenced movement
    // is the last in the chain.
    if (!mvmntRef.source?.prevMvmnt) {
      return mvmntRef;
    }

    return traceBackwards(tankId, mvmntRef.source?.prevMvmnt?.movement);
  }

  // If the current movement reference represents a movement into
  // the referenced tank, and that tank was empty prior to the operation,
  // than we have identified the initial movement.
  if (!mvmntRef.dest) {
    throw Error(
      `Referenced movement has no destination information associated with it.`
    );
  }

  if (!mvmntRef.dest.tank) {
    throw Error(
      `Referenced movement has no destination tank information assigned.`
    );
  }

  if (mvmntRef.dest.tank.id == tankId && mvmntRef.dest.previousGallons < 1) {
    return mvmntRef;
  }

  // At this point, the current movement reference does not refer to the original
  // movement, so we need to recurse to identify that original movement.
  // Basically we recurse until the 'initial' movement is found.
  return traceBackwards(tankId, mvmntRef.source?.movement);
};

/**
 * Perform 'foward' tracing, which basically given the starting point in a
 * series of related operations for a given tank, identify all operations
 * from the provided 'starting point' until the tank has emptied (indicating)
 *
 * Much like 'backwards' tracing, we perform this as an iterative process.
 *
 * @param tankId Reference to the tank that we are focusing to identify activity for
 * @param curMvmnt Movement representing the current point we are tracing. Iniital call
 * will reflect the 'first' movement in the sequence, and subsequent iterative
 * calls will represent the current point in
 * @returns An array movements in historical sequential order representing
 * the entire series of events up until the last or last recorded event.
 */
export const forwardTrace = (
  tankId: number,
  curMvmnt: Movement
): Array<Movement> => {
  if (curMvmnt == null) {
    return [];
  }

  // Handle scenarios where there is no actual movement
  if (curMvmnt.isActualMovement()) {
    // ... No physical next recorded movement
    if (!curMvmnt.dest?.nextMvmnt || !curMvmnt.dest.nextMvmnt.movement) {
      return [curMvmnt];
    }
    const nextMvmnts: Array<Movement> = forwardTrace(
      tankId,
      curMvmnt.dest?.nextMvmnt?.movement
    );
    const activity: Array<Movement> = [];
    activity.push(curMvmnt);
    activity.push(...nextMvmnts);
    return activity;
  }

  // Otherwise we continue tracing forward
  if (curMvmnt.isMovementOutbound(tankId)) {
    // Tank has emptied
    if (curMvmnt.source?.afterGallons == 0) {
      return [curMvmnt];
    }

    // There is no 'next' defined movement
    if (!curMvmnt.source?.nextMvmnt) {
      return [curMvmnt];
    }

    // Otherwise we continue tracing forward along the tank
    // in target.
    const nextMvmnts: Array<Movement> = forwardTrace(
      tankId,
      curMvmnt.source?.movement
    );
    const activity: Array<Movement> = [];
    activity.push(curMvmnt);
    activity.push(...nextMvmnts);
    return activity;
  } else {
    // Current movement is into the tank in scope...

    if (!curMvmnt.dest?.nextMvmnt) {
      return [curMvmnt];
    }

    const nextMvmnts: Array<Movement> = forwardTrace(
      tankId,
      curMvmnt.source?.movement
    );
    const activity: Array<Movement> = [];
    activity.push(curMvmnt);
    activity.push(...nextMvmnts);
    return activity;
  }
  return [];
};
