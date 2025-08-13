/**
 * Entity loading service:
 *
 * This module is responsible for loading data used for
 * trace operations. Do to the amount of effort required to
 * load certain data via raw sql and stage in memory as part of
 * an optimized fetching strategy, it made sense to isolate
 * this logic in a dedicated file.
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
import { loadAllMovements } from "@/repo/loaders/movement-loader";
import { loadAllMovementSegments } from "@/repo/loaders/movement-segment-loader";
import MovementQueryResult from "@/repo/loaders/query-result/movement-query-result";
import MovementSegmentQueryResult from "@/repo/loaders/query-result/movement-segment-query-result";
import TankQueryResult from "@/repo/loaders/query-result/tank-query-result";
import WorkOrderQueryResult from "@/repo/loaders/query-result/work-order-query-result";
import { loadAllTanks } from "@/repo/loaders/tank-loader";
import { loadAllRawWoData } from "@/repo/loaders/work-order-loader";
import { getAllOperationCodes } from "@/repo/op-code-repo";
import { getAllTankStatuses } from "@/repo/tank-status-repo";
import { getAllTankTypes } from "@/repo/tank-type-repo";
import { getAllWoStatusCodes } from "@/repo/wo-status-code-repo";
import {
  mapMovementIfsToModels,
  mapMovementSegmentIfsToModels,
  mapTankIfsToModels,
  mapTankInterfaceToModel,
  mapWorkOrderIfsToModels,
} from "@/services/entity-mapping-service";

export interface ActivityModel {
  opCodesMap: Map<number, OperationCode>;
  woStatusCodesMap: Map<number, WorkOrderStatus>;
  tankStatusesMap: Map<number, TankStatus>;
  tankTypesMap: Map<number, TankType>;
  tanksMap: Map<number, Tank>;
  mvmntSegmentsMap: Map<number, MovementSegment>;
  woMap: Map<number, WorkOrder>;
  mvmntsMap: Map<number, Movement>;
}

export const loadActivityGraph = (): ActivityModel => {
  let operationCodes: Map<number, OperationCode> = new Map();
  let woStatusCodes: Map<number, WorkOrderStatus> = new Map();
  let tankStatuses: Map<number, TankStatus> = new Map();
  let tankTypes: Map<number, TankType> = new Map();

  const tanksMap: Map<number, Tank> = new Map();
  const mvmntsMap: Map<number, Movement> = new Map();
  const wosMap: Map<number, WorkOrder> = new Map();
  const mvmntSegmentsMap: Map<number, MovementSegment> = new Map();

  const model: ActivityModel = {
    opCodesMap: operationCodes,
    woStatusCodesMap: woStatusCodes,
    tankStatusesMap: tankStatuses,
    tankTypesMap: tankTypes,
    tanksMap: tanksMap,
    mvmntSegmentsMap: mvmntSegmentsMap,
    woMap: wosMap,
    mvmntsMap: mvmntsMap,
  };

  loadDictData(model);
  loadEntityData(model);

  return model;
};

/**
 * Load data from objects that have no fk relations via ORM.
 */
export const loadDictData = async (model: ActivityModel) => {
  // Load all operation codes into memory...
  const opCodeData: Array<OperationCode> = await getAllOperationCodes();
  //console.log(`type:`, opCodeData);
  opCodeData.forEach((record: OperationCode) => {
    model.opCodesMap?.set(record.id, record);
  });

  // Load all tank statuses into memory...
  const woStatusCodeData: Array<WorkOrderStatus> = await getAllWoStatusCodes();
  woStatusCodeData.forEach((record: TankStatus) => {
    model.woStatusCodesMap.set(record.id, record);
  });

  // Load all tank statuses into memory...
  const tankStatusData: Array<TankStatus> = await getAllTankStatuses();
  tankStatusData.forEach((record: TankStatus) => {
    model.tankStatusesMap.set(record.id, record);
  });

  // Load all tank types into memory...
  const tankTypesData: Array<TankType> = await getAllTankTypes();
  model.tankTypesMap.forEach((record: TankType) => {
    model.tankTypesMap.set(record.id, record);
  });
};

/**
 * Load data that does have relations via direct SQL, translate
 * them into model equivelents, and then manually establish relations.
 *
 * @param model
 */
export const loadEntityData = async (model: ActivityModel) => {
  // Load tanks
  const rawTankList: Array<TankQueryResult> = loadAllTanks();
  model.tanksMap = mapTankIfsToModels(
    rawTankList,
    model.tankStatusesMap,
    model.tankTypesMap
  );

  // map all movement segments.
  const rawMvmntSegList: Array<MovementSegmentQueryResult> =
    loadAllMovementSegments();
  model.mvmntSegmentsMap = mapMovementSegmentIfsToModels(
    rawMvmntSegList,
    model.tanksMap
  );

  // map all movements
  let curMvmnt: Movement;
  const rawMvmntList: Array<MovementQueryResult> = loadAllMovements();
  model.mvmntsMap = mapMovementIfsToModels(
    rawMvmntList,
    model.mvmntSegmentsMap
  );

  // map all work orders
  let curWo: WorkOrder;
  const rawWoList: Array<WorkOrderQueryResult> = loadAllRawWoData();
  model.woMap = mapWorkOrderIfsToModels(
    rawWoList,
    model.opCodesMap,
    model.woStatusCodesMap,
    model.mvmntsMap,
    rawMvmntList
  );
};
