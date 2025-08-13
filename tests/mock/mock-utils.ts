/**
 * Mock utils:
 *
 * Routines related to retrieving mock data for 'dictionary' type objects. This
 * data in the real world scenarios, this data would be retrieved via an .findAll()
 * type approach.
 *
 * For operations related to loading data for data loaded from an bulk
 * SQL type approach, see 'sql-mocks'.
 *
 * Additionally, convenience methods are provided for accessing map structures
 * containing models for which the data would have originated from
 * raw sql.
 */

import Movement from "@models/movement.model";
import TankStatus from "@models/tank-status.model";
import TankType from "@/models/tank-type.model";
import Tank from "@models/tank.model";
import WorkOrder from "@models/work-order-model";
import WorkOrderStatus from "@models/work-order-status.model";
import MovementSegment from "@models/movement-segment.model";
import OperationCode from "@models/operation-code.model";
import TankQueryResult from "@repos/loaders/query-result/tank-query-result";
import {
  mapMovementIfsToModels,
  mapMovementSegmentIfsToModels,
  mapTankIfsToModels,
  mapWorkOrderIfsToModels,
  setPrevRef,
  setNextRef,
} from "@services/entity-mapping-service";
import {
  loadAllMockMovementSegmentSqlRecords,
  loadAllMockMovementSqlRecords,
  loadAllMockTankSqlRecords,
  loadAllMockWoSqlRecords,
} from "./sql-mocks";
import MovementQueryResult from "@repos/loaders/query-result/movement-query-result";
import { ActivityModel } from "@/services/entity-load-service";

/**
 *
 * @returns Emulate an ORM fetch for all types of op code entity
 */
export const getAllMockOperationCodes = (): Array<OperationCode> => {
  let opCode: OperationCode;
  let results: Array<OperationCode> = [];

  opCode = new OperationCode();
  opCode.id = 1;
  opCode.name = "Juice extraction";
  results.push(opCode);

  opCode = new OperationCode();
  opCode.id = 2;
  opCode.name = "Pasturize";
  results.push(opCode);

  opCode = new OperationCode();
  opCode.id = 3;
  opCode.name = "Cool";
  results.push(opCode);

  opCode = new OperationCode();
  opCode.id = 4;
  opCode.name = "Pump";
  results.push(opCode);

  opCode = new OperationCode();
  opCode.id = 5;
  opCode.name = "Package";
  results.push(opCode);

  opCode = new OperationCode();
  opCode.id = 6;
  opCode.name = "Filter";
  results.push(opCode);

  return results;
};

/**
 * Return the result of converting an array of operation code objects into a map object
 * for fast lookups.
 *
 */
export const getMockOpcodeMap = (): Map<number, OperationCode> => {
  const opCodeData = getAllMockOperationCodes();
  let operationCodes: Map<number, OperationCode> = new Map();

  opCodeData.forEach((record: OperationCode) => {
    operationCodes.set(record.id, record);
  });

  return operationCodes;
};

export const getAllMockWoStatusCodes = (): Array<WorkOrderStatus> => {
  let status: WorkOrderStatus;
  let results: Array<WorkOrderStatus> = [];

  status = new WorkOrderStatus();
  status.id = 1;
  status.name = "Draft";
  results.push(status);

  status.id = 2;
  status.name = "Ready";
  results.push(status);

  status.id = 3;
  status.name = "In progress";
  results.push(status);

  status.id = 4;
  status.name = "Completed";
  results.push(status);

  status.id = 5;
  status.name = "Validated";
  results.push(status);

  status.id = 6;
  status.name = "Cancelled";
  results.push(status);

  return results;
};

export const getMockWorkOrderStatusCodesMap = () => {
  const woStatusData = getAllMockWoStatusCodes();
  let woStatusMap: Map<number, WorkOrderStatus> = new Map();

  woStatusData.forEach((record: WorkOrderStatus) => {
    woStatusMap.set(record.id, record);
  });

  return woStatusMap;
};

export const getAllMockTankTypes = (): Array<TankType> => {
  let type: TankType;
  const results: Array<TankType> = [];

  type = new TankType();
  type.id = 1;
  type.name = "Juice extraction";
  results.push(type);

  type = new TankType();
  type.id = 2;
  type.name = "Long term storage";
  results.push(type);

  type = new TankType();
  type.id = 3;
  type.name = "Temp storage";
  results.push(type);

  type = new TankType();
  type.id = 4;
  type.name = "Packaging";
  results.push(type);

  type = new TankType();
  type.id = 5;
  type.name = "Cooler";
  results.push(type);

  type = new TankType();
  type.id = 6;
  type.name = "Pasturization";
  results.push(type);

  type = new TankType();
  type.id = 7;
  type.name = "Filter";
  results.push(type);

  return results;
};

export const getMockTankTypeMap = () => {
  const tankTypeData = getAllMockTankTypes();
  let tankTypes: Map<number, TankType> = new Map();

  tankTypes.forEach((record: TankType) => {
    tankTypes.set(record.id, record);
  });

  return tankTypes;
};

export const getAllMockTankStatusCodes = (): Array<TankStatus> => {
  let status: TankStatus;
  let results: Array<TankStatus> = [];

  status = new TankStatus();
  status.id = 1;
  status.name = "Ready";
  results.push(status);

  status.id = 2;
  status.name = "In use";
  results.push(status);

  status.id = 3;
  status.name = "Offline";
  results.push(status);

  return results;
};

export const getAllMockTankStatusCodesMap = (): Map<number, TankStatus> => {
  const resultsMap: Map<number, TankStatus> = new Map();

  const statusCodes: Array<TankStatus> = getAllMockTankStatusCodes();

  statusCodes.forEach((code) => {
    resultsMap.set(code.id, code);
  });

  return resultsMap;
};

export const getMockTankStatusCodeMap = () => {
  const tankStatusData = getAllMockTankStatusCodes();
  let tankStatuses: Map<number, TankStatus> = new Map();

  tankStatusData.forEach((record: TankStatus) => {
    tankStatuses.set(record.id, record);
  });

  return tankStatuses;
};

/********************************************************************************
 * Routines for buld sql load operations that have been converted into models.
 * These are required to test operations where we are translating sql interfaces
 * into models; these routines require data loaded from the orm layer (mocked in
 * this file) in addition to related objects that have been previously converted
 * been converted from if to model entities; i.e. building a movement
 * requires movement segment entities build from a previous step so
 * that it may establish relations.
 ********************************************************************************/
export const getMockTankModelsMap = (): Map<number, Tank> => {
  const tankRecords: Array<TankQueryResult> = loadAllMockTankSqlRecords();

  const resultsMap: Map<number, Tank> = mapTankIfsToModels(
    tankRecords,
    getMockTankStatusCodeMap(),
    getMockTankTypeMap()
  );

  return resultsMap;
};

export const getMockWorkOrderModelsMap = (): Map<number, WorkOrder> => {
  // Retrieve work order sql interface data to be converted.
  const woInterfaces = loadAllMockWoSqlRecords();

  const resultsMap: Map<number, WorkOrder> = mapWorkOrderIfsToModels(
    woInterfaces,
    getMockOpcodeMap(),
    getMockWorkOrderStatusCodesMap(),
    getMockMovementsModelMap(),
    loadAllMockMovementSqlRecords()
  );

  return resultsMap;
};

export const getMockMovementsModelMap = (): Map<number, Movement> => {
  // Retrieve work models, this is required as the following function
  // will assign the many to one reference to the work order is established.
  const woIfs = loadAllMockWoSqlRecords();

  const resultsMap: Map<number, Movement> = mapMovementIfsToModels(
    loadAllMockMovementSqlRecords(),
    getMockMovementSegmentModelMap()
  );

  return resultsMap;
};

export const getMockMovementSegmentModelMap = (): Map<
  number,
  MovementSegment
> => {
  // get movement seg if data
  const mvmntSegIfs = loadAllMockMovementSegmentSqlRecords();

  // get tank models
  const tankModels: Map<number, Tank> = getMockTankModelsMap();

  //Perform conversions
  const resultsMap: Map<number, MovementSegment> =
    mapMovementSegmentIfsToModels(mvmntSegIfs, tankModels);

  return resultsMap;
};

/**
 * Retrieve a collection of mock work orders modeling a transaction
 * sequence as described in the readme file located in the current
 * folder.
 *
 * This process is manual, doesnt 'feel right', and is noted that there
 * is potential for a DSL based generative approach, but in the interest
 * of time, that effort is reserved for a future date.
 *
 */
export const getMockWoEventSequence = (): Array<WorkOrder> => {
  const wos: Array<WorkOrder> = [];
  let curWo: WorkOrder;
  let curMvmnt: Movement;
  let srcMvmntSeg, destMvmntSeg: MovementSegment;

  const opCodeMap: Map<number, OperationCode> = getMockOpcodeMap();
  const tankMap: Map<number, Tank> = getMockTankModelsMap();

  const commonTank: Tank | undefined = tankMap.get(5);

  if (!commonTank) {
    throw Error("Bas logic in staging data....");
  }

  // We need to track movement segments so that we can assign
  // relations
  const mvmntSegDefMap: Map<number, MovementSegment> = new Map();

  // Staging first movement...
  curWo = new WorkOrder();
  curWo.id = 1;
  curWo.workOrderNumber = "WO-001";
  curWo.operationCode = opCodeMap.get(4);

  curMvmnt = new Movement();
  curMvmnt.id = 1;
  curMvmnt.requestedGallons = 100;
  curMvmnt.workOrder = curWo;
  curWo.movements = [];
  curWo.movements.push(curMvmnt);

  srcMvmntSeg = new MovementSegment();
  srcMvmntSeg.id = 1;

  destMvmntSeg = new MovementSegment();
  destMvmntSeg.id = 2;
  destMvmntSeg.tank = commonTank;

  curMvmnt.source = srcMvmntSeg;
  curMvmnt.dest = destMvmntSeg;

  mvmntSegDefMap.set(destMvmntSeg.id, destMvmntSeg);
  mvmntSegDefMap.set(srcMvmntSeg.id, srcMvmntSeg);

  wos.push(curWo);

  // Staging second movement...
  curWo = new WorkOrder();
  curWo.id = 2;
  curWo.workOrderNumber = "WO-002";
  curWo.operationCode = opCodeMap.get(4);

  curMvmnt = new Movement();
  curMvmnt.id = 2;
  curMvmnt.requestedGallons = 100;
  curMvmnt.workOrder = curWo;
  curWo.movements = [];
  curWo.movements.push(curMvmnt);

  srcMvmntSeg = new MovementSegment();
  srcMvmntSeg.id = 3;

  destMvmntSeg = new MovementSegment();
  destMvmntSeg.id = 4;
  destMvmntSeg.tank = commonTank;

  curMvmnt.source = srcMvmntSeg;
  curMvmnt.dest = destMvmntSeg;

  mvmntSegDefMap.set(destMvmntSeg.id, destMvmntSeg);
  mvmntSegDefMap.set(srcMvmntSeg.id, srcMvmntSeg);

  wos.push(curWo);

  // And third and last 'inbound' movement...
  curWo = new WorkOrder();
  curWo.id = 3;
  curWo.workOrderNumber = "WO-003";
  curWo.operationCode = opCodeMap.get(4);

  curMvmnt = new Movement();
  curMvmnt.id = 3;
  curMvmnt.requestedGallons = 100;
  curMvmnt.workOrder = curWo;
  curWo.movements = [];
  curWo.movements.push(curMvmnt);

  srcMvmntSeg = new MovementSegment();
  srcMvmntSeg.id = 5;

  destMvmntSeg = new MovementSegment();
  destMvmntSeg.id = 6;
  destMvmntSeg.tank = commonTank;

  curMvmnt.source = srcMvmntSeg;
  curMvmnt.dest = destMvmntSeg;

  mvmntSegDefMap.set(destMvmntSeg.id, destMvmntSeg);
  mvmntSegDefMap.set(srcMvmntSeg.id, srcMvmntSeg);

  wos.push(curWo);

  // And the final movement
  curWo = new WorkOrder();
  curWo.id = 4;
  curWo.workOrderNumber = "WO-004";
  curWo.operationCode = opCodeMap.get(4);

  curMvmnt = new Movement();
  curMvmnt.id = 4;
  curMvmnt.requestedGallons = 300;
  curMvmnt.workOrder = curWo;
  curWo.movements = [];
  curWo.movements.push(curMvmnt);

  srcMvmntSeg = new MovementSegment();
  srcMvmntSeg.id = 7;

  destMvmntSeg = new MovementSegment();
  destMvmntSeg.id = 8;
  destMvmntSeg.tank = commonTank;

  curMvmnt.source = srcMvmntSeg;
  curMvmnt.dest = destMvmntSeg;

  mvmntSegDefMap.set(destMvmntSeg.id, destMvmntSeg);
  mvmntSegDefMap.set(srcMvmntSeg.id, srcMvmntSeg);

  wos.push(curWo);

  /* And finally... we establish all movement segment level relations...
   This might appear counter intuitive to ake this approach, however
   since this involves bi-directional relations, it is the most straighforward
  approach. */

  setNextRef(2, 4, mvmntSegDefMap);
  setPrevRef(4, 2, mvmntSegDefMap);
  setNextRef(4, 6, mvmntSegDefMap);
  setPrevRef(6, 4, mvmntSegDefMap);
  setPrevRef(7, 6, mvmntSegDefMap);
  setNextRef(6, 7, mvmntSegDefMap);

  return wos;
};

/**
 * Retrieve a staged set of activity. This is a direct replacement for the
 * operation where all activity is loaded as a bulk operation prior to
 * any tracing activity.
 *
 * Mock data is staged and then set into the required format.
 *
 * @returns
 */
export const getMockWoEventSequenceMvmntMap = (): Map<number, Movement> => {
  const workOrders: Array<WorkOrder> = getMockWoEventSequence();
  const mvmntsMap: Map<number, Movement> = new Map();

  workOrders.forEach((curWo: WorkOrder) => {
    curWo.movements?.forEach((curMvmnt: Movement) => {
      mvmntsMap.set(curMvmnt.id, curMvmnt);
    });
  });

  return mvmntsMap;
};

export const loadMockActivityGraph = (): ActivityModel => {
  const mockModel: ActivityModel = {
    opCodesMap: getMockOpcodeMap(),
    woStatusCodesMap: getMockWorkOrderStatusCodesMap(),
    tankStatusesMap: getAllMockTankStatusCodesMap(),
    tankTypesMap: getMockTankTypeMap(),
    tanksMap: getMockTankModelsMap(),
    mvmntSegmentsMap: getMockMovementSegmentModelMap(),
    woMap: getMockWorkOrderModelsMap(),
    mvmntsMap: getMockWoEventSequenceMvmntMap(),
  };

  return mockModel;
};
