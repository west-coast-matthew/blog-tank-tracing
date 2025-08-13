/**
 * SQL Mock routines:
 *
 * Routines used to emulate the extraction of data from raw SQL quieries into table specific
 * interfaces.
 *
 * The data mocked...
 */
import TankQueryResult from "@repos/loaders/query-result/tank-query-result";
import WorkOrderQueryResult from "@repos/loaders/query-result/work-order-query-result";
import MovementQueryResult from "@repos/loaders/query-result/movement-query-result";
import MovementSegmentQueryResult from "@repos/loaders/query-result/movement-segment-query-result";

/********************************************************************************
 * Routines for buld sql load operations
 ********************************************************************************/
/**
 * Extract all tanks
 */
export const loadAllMockTankSqlRecords = (): Array<TankQueryResult> => {
  const results: Array<TankQueryResult> = [];

  // Create a series of long term storage tanks...
  results.push({
    id: 1,
    name: "mock-tank-1",
    tank_status_id: 1,
    tank_type_id: 2,
  });
  results.push({
    id: 2,
    name: "mock-tank-2",
    tank_status_id: 2,
    tank_type_id: 2,
  });
  results.push({
    id: 3,
    name: "mock-tank-3",
    tank_status_id: 3,
    tank_type_id: 2,
  });
  results.push({
    id: 4,
    name: "mock-tank-4",
    tank_status_id: 4,
    tank_type_id: 2,
  });
  results.push({
    id: 5,
    name: "mock-tank-5",
    tank_status_id: 5,
    tank_type_id: 5,
  });

  return results;
};

/**
 * Extract all work orders
 */
export const loadAllMockWoSqlRecords = (): Array<WorkOrderQueryResult> => {
  let results: Array<WorkOrderQueryResult> = [];

  // Work order battery 1: For drain operations into a single destination tank
  // tanks 1-4 drain into common destination tank #5
  results.push({
    id: 1,
    work_order_number: "WO-001",
    description: "Mock work order -drain operation",
    status_code_id: 1,
    op_code_id: 4,
    notes: "",
  });
  results.push({
    id: 2,
    work_order_number: "WO-002",
    description: "Mock work order -drain operation",
    status_code_id: 1,
    op_code_id: 4,
    notes: "",
  });
  results.push({
    id: 3,
    work_order_number: "WO-003",
    description: "Mock work order -drain operation",
    status_code_id: 1,
    op_code_id: 4,
    notes: "",
  });
  results.push({
    id: 4,
    work_order_number: "WO-004",
    description: "Mock work order -drain operation",
    status_code_id: 1,
    op_code_id: 4,
    notes: "",
  });

  return results;
};

/**
 * Extract all movements
 */
export const loadAllMockMovementSqlRecords = (): Array<MovementQueryResult> => {
  const results: Array<MovementQueryResult> = [];

  // Movements related to work order battery 1
  results.push({
    id: 1,
    work_order_id: 1,
    req_gallons: 100,
    src_segment_id: 0,
    dest_segment_id: 0,
  });
  results.push({
    id: 2,
    work_order_id: 2,
    req_gallons: 0,
    src_segment_id: 0,
    dest_segment_id: 0,
  });
  results.push({
    id: 3,
    work_order_id: 3,
    req_gallons: 0,
    src_segment_id: 0,
    dest_segment_id: 0,
  });
  results.push({
    id: 4,
    work_order_id: 4,
    req_gallons: 0,
    src_segment_id: 0,
    dest_segment_id: 0,
  });

  return results;
};

/**
 * Extract all movement segments
 */
export const loadAllMockMovementSegmentSqlRecords =
  (): Array<MovementSegmentQueryResult> => {
    const results: Array<MovementSegmentQueryResult> = [];
    let mvmntSeg: MovementSegmentQueryResult;

    /** work order battery 1 related */
    // mvmnt segs for work order 1
    results.push({
      id: 1,
      movement_id: 1,
      tank_id: 1,
      previous_gallons: 100,
      after_gallons: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    results.push({
      id: 2,
      movement_id: 1,
      tank_id: 5,
      previous_gallons: 0,
      after_gallons: 100,
      created_at: new Date(),
      updated_at: new Date(),
      next_mvmnt_seg_id: 4,
    });

    // mvmnt seg for work order 2
    results.push({
      id: 3,
      movement_id: 2,
      tank_id: 2,
      previous_gallons: 100,
      after_gallons: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    results.push({
      id: 4,
      movement_id: 2,
      tank_id: 5,
      previous_gallons: 100,
      after_gallons: 200,
      created_at: new Date(),
      updated_at: new Date(),
      prev_mvmnt_seg_id: 2,
      next_mvmnt_seg_id: 6,
    });

    // mvmnt seg for work order 3
    results.push({
      id: 5,
      movement_id: 3,
      tank_id: 3,
      previous_gallons: 100,
      after_gallons: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    results.push({
      id: 6,
      movement_id: 3,
      tank_id: 5,
      previous_gallons: 200,
      after_gallons: 300,
      created_at: new Date(),
      updated_at: new Date(),
      prev_mvmnt_seg_id: 4,
      next_mvmnt_seg_id: 7,
    });

    // mvmnt seg for work order 4
    results.push({
      id: 7,
      movement_id: 4,
      tank_id: 4,
      previous_gallons: 100,
      after_gallons: 0,
      created_at: new Date(),
      updated_at: new Date(),
      prev_mvmnt_seg_id: 6,
    });
    results.push({
      id: 8,
      movement_id: 4,
      tank_id: 5,
      previous_gallons: 300,
      after_gallons: 400,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return results;
  };

/********************************************************************************
 * Routines for single record sql load operations
 ********************************************************************************/
export const getMockTankSqlRecord = (pos: number = 0): TankQueryResult => {
  return loadAllMockTankSqlRecords()[pos];
};

export const getMockWoSqlRecord = (pos: number = 0): WorkOrderQueryResult => {
  return loadAllMockWoSqlRecords()[pos];
};

export const getMockMvmntSqlRecord = (pos: number = 0): MovementQueryResult => {
  return loadAllMockMovementSqlRecords()[pos];
};

export const getMockMvmntSegSqlRecord = (
  pos: number = 0
): MovementSegmentQueryResult => {
  return loadAllMockMovementSegmentSqlRecords()[pos];
};
