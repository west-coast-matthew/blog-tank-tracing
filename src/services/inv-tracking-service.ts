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
 * @param mvmntId
 * @param tankId
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

  return [];
};
