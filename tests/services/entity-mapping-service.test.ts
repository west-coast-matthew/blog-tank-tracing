import Tank from "@models/tank.model";
import TankQueryResult from "@repos/loaders/query-result/tank-query-result";
import {
  getMockMvmntSegSqlRecord,
  getMockMvmntSqlRecord,
  getMockTankSqlRecord,
  getMockWoSqlRecord,
  loadAllMockMovementSegmentSqlRecords,
  loadAllMockMovementSqlRecords,
  loadAllMockTankSqlRecords,
  loadAllMockWoSqlRecords,
} from "../mock/sql-mocks";
import WorkOrderQueryResult from "@repos/loaders/query-result/work-order-query-result";
import MovementQueryResult from "@repos/loaders/query-result/movement-query-result";
import MovementSegmentQueryResult from "@repos/loaders/query-result/movement-segment-query-result";
import WorkOrder from "@models/work-order-model";
import Movement from "@models/movement.model";
import MovmentSegment from "@models/movement-segment.model";
import {
  establishMovementSegmentInternalReferences,
  mapMovementIfsToModels,
  mapMovementSegmentIfsToModels,
  mapMvmntInterfaceToModel,
  mapMvmntSgmntInterfaceToModel,
  mapTankIfsToModels,
  mapTankInterfaceToModel,
  mapWoInterfaceToModel,
  mapWorkOrderIfsToModels,
} from "@services/entity-mapping-service";
import {
  getMockOpcodeMap,
  getMockTankStatusCodeMap,
  getMockTankTypeMap,
  getMockWorkOrderStatusCodesMap,
  getMockTankModelsMap,
  getMockMovementsModelMap,
  getMockMovementSegmentModelMap,
} from "../mock/mock-utils";
import TankStatus from "@models/tank-status.model";
import TankType from "@models/tank-type.model";
import OperationCode from "@models/operation-code.model";
import WorkOrderStatus from "@models/work-order-status.model";
import MovementSegment from "@models/movement-segment.model";

describe("Entity mapping service", () => {
  /**
   * Ensure that we can map interface wrappers for data produced from raw
   * sql calls into the model representation (minus relations).
   */
  describe("If to model mapping operations", () => {
    test("Map tank entity", () => {
      const tankIf: TankQueryResult = getMockTankSqlRecord();
      const tankModel: Tank = mapTankInterfaceToModel(tankIf);
      expect(tankModel).toBeTruthy();
      expect(tankModel.id).toBe(1);
      expect(tankModel.name).toBe("mock-tank-1");
    });

    test("Map work order entity", () => {
      const woIf: WorkOrderQueryResult = getMockWoSqlRecord();
      const woModel: WorkOrder = mapWoInterfaceToModel(woIf);

      expect(woModel).toBeTruthy();
      expect(woModel.id).toBe(1);
      expect(woModel.workOrderNumber).toBe("WO-001");
    });

    test("Map movement", () => {
      const mvmntIf: MovementQueryResult = getMockMvmntSqlRecord();
      const mvmntModel: Movement = mapMvmntInterfaceToModel(mvmntIf);

      expect(mvmntModel).toBeTruthy();
      expect(mvmntModel.id).toBe(1);
      expect(mvmntModel.requestedGallons).toBe(100);
    });

    test("Map movement segment", () => {
      const mvmntSegIf: MovementSegmentQueryResult = getMockMvmntSegSqlRecord();
      mvmntSegIf.after_gallons = 99;
      mvmntSegIf.previous_gallons = 21;

      const mvmntSeg: MovmentSegment =
        mapMvmntSgmntInterfaceToModel(mvmntSegIf);

      expect(mvmntSeg).toBeTruthy();
      expect(mvmntSeg.id).toBe(1);
      expect(mvmntSeg.afterGallons).toBe(99);
      expect(mvmntSeg.previousGallons).toBe(21);
    });
  });

  /**
   * Validate that helper methods for translating interfaces for sql
   * data collections into map structure containing id and model representatoins.
   */
  describe("If collection to model mapping operations", () => {
    /**
     * Map wrappers for sql tank data into models and establish any references.
     */
    test("Map tank entity", () => {
      const tankStatusesMap: Map<number, TankStatus> =
        getMockTankStatusCodeMap();
      const tankTypesMap: Map<number, TankType> = getMockTankTypeMap();

      const tankModelMap: Map<number, Tank> = mapTankIfsToModels(
        loadAllMockTankSqlRecords(),
        tankStatusesMap,
        tankTypesMap
      );
      expect(tankModelMap).toBeTruthy();
      expect(tankModelMap.size).toBe(5);

      expect(tankModelMap.has(1)).toBe(true);
      expect(tankModelMap.has(2)).toBe(true);
      expect(tankModelMap.has(3)).toBe(true);
      expect(tankModelMap.has(4)).toBe(true);
      expect(tankModelMap.has(5)).toBe(true);

      expect(tankModelMap.get(1)?.tankStatus).not.toBe(null);
      expect(tankModelMap.get(1)?.tankType).not.toBe(null);
      expect(tankModelMap.get(2)?.tankStatus).not.toBe(null);
      expect(tankModelMap.get(2)?.tankType).not.toBe(null);
      expect(tankModelMap.get(3)?.tankStatus).not.toBe(null);
      expect(tankModelMap.get(3)?.tankType).not.toBe(null);
      expect(tankModelMap.get(4)?.tankStatus).not.toBe(null);
      expect(tankModelMap.get(4)?.tankType).not.toBe(null);
      expect(tankModelMap.get(5)?.tankStatus).not.toBe(null);
      expect(tankModelMap.get(5)?.tankType).not.toBe(null);
    });

    /**
     * Map work order sql wrappers into the object equivelents, establishing relations as
     * appropriate.
     */
    test("Map work order entity", () => {
      const opCodesMap: Map<number, OperationCode> = getMockOpcodeMap();
      const woStatusCodesMap: Map<number, WorkOrderStatus> =
        getMockWorkOrderStatusCodesMap();
      const movementsMap: Map<number, Movement> = getMockMovementsModelMap();
      const movementIfs: Array<MovementQueryResult> =
        loadAllMockMovementSqlRecords();

      const result: Map<number, WorkOrder> = mapWorkOrderIfsToModels(
        loadAllMockWoSqlRecords(),
        opCodesMap,
        woStatusCodesMap,
        movementsMap,
        movementIfs
      );
      expect(result).toBeTruthy();
    });

    /**
     * Ensure we can convert sql wrappers for movements into models, and that bi-directional
     * relations between movements and the associated segments are established.
     */
    test("Map movements from if to model", () => {
      const mvmntSegMap = getMockMovementSegmentModelMap();

      const result: Map<number, Movement> = mapMovementIfsToModels(
        loadAllMockMovementSqlRecords(),
        mvmntSegMap
      );
      expect(result).toBeTruthy();
    });

    /**
     * Ensure translation of sql data for movment segments are correctly performed,
     * and relations are established.
     */
    test("Map movement segment ifs to model equivelent", () => {
      const tanksMap: Map<number, Tank> = getMockTankModelsMap();
      const result: Map<number, MovementSegment> =
        mapMovementSegmentIfsToModels(
          loadAllMockMovementSegmentSqlRecords(),
          tanksMap
        );
      expect(result).toBeTruthy();
    });
  });

  const getMockMovmentSegment = (
    id: number,
    next?: MovementSegment,
    prev?: MovementSegment
  ): MovementSegment => {
    const seg: MovementSegment = new MovementSegment();
    seg.id = id;
    seg.prevMvmnt = prev;
    seg.nextMvmnt = next;
    return seg;
  };

  const getMockMovementSegmentIf = (
    id: number,
    nextId?: number,
    prevId?: number
  ): MovementSegmentQueryResult => {
    const seg: MovementSegmentQueryResult = {
      id: id,
      tank_id: 1,
      previous_gallons: 0,
      after_gallons: 0,
      movement_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (prevId) {
      seg.prev_mvmnt_seg_id = prevId;
    }

    if (nextId) {
      seg.next_mvmnt_seg_id = nextId;
    }

    return seg;
  };

  test("Confirm we can map movement segment refs correctly", () => {
    const mvmntSegs: Map<number, MovementSegment> = new Map();
    const sqlRefs: Array<MovementSegmentQueryResult> =
      loadAllMockMovementSegmentSqlRecords();

    /*
    let result
    let seg: MovementSegment;
    let segIf, next, prev: MovementSegmentQueryResult;

    seg = getMockMovmentSegment(1);
    segIf = getMockMovementSegmentIf(1);

    mvmntSegs.set(seg.id, seg);
    sqlRefs.push(segIf);*/

    // Wipe all references between movement segments as

    // And now call the method responsible for establishing movement
    // segment references, and validate the results.
    establishMovementSegmentInternalReferences(mvmntSegs, sqlRefs);
  });
});
