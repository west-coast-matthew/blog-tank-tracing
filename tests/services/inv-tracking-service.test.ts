/**
 * Test battery for operations related to inventory tracking.
 * Since we are focusing on tracing operations, we mock the
 * data used to model activity.
 */

import { ActivityModel } from "@/services/entity-load-service";
import {
  getInMemoryStore,
  getMovementSequence,
  initInMemoryStructure,
} from "@/services/inv-tracking-service";
import {
  getAllMockTankStatusCodesMap,
  getMockMovementSegmentModelMap,
  getMockOpcodeMap,
  getMockTankModelsMap,
  getMockTankTypeMap,
  getMockWoEventSequenceMvmntMap,
  getMockWorkOrderModelsMap,
  getMockWorkOrderStatusCodesMap,
  loadMockActivityGraph,
} from "../mock/mock-utils";

jest.mock("../../src/services/entity-load-service", () => ({
  loadActivityGraph: jest.fn(() => loadMockActivityGraph()),
}));

describe("Inventory tracking related operations", () => {
  beforeAll(() => {
    initInMemoryStructure();
  });

  /**
   * Before any operations may be performed, this service needs to
   * load all relevant data to support the 'in memory' data retrieval
   * strategy.
   */
  test("Validate we can initialize the in memory data store correctly", () => {
    const activityModel = getInMemoryStore();

    expect(activityModel).toBeTruthy();
    expect(activityModel?.woMap).toBeTruthy();
    expect(activityModel?.woMap.size == 4);
    expect(activityModel?.mvmntsMap.size == 4);
  });

  /**
   * Given a movement, and a take, identify all movements that are related from
   * that selected tank and given point in time, from the first and
   * last reported movements.
   */
  test("Validate we can walk a movement sequence", () => {});

  /**
   * Given an historical point for a selected activity, locate everything
   * from that particular point moving forward. This would fall under the scope
   * of a product recall.
   */
  test("Validate we can perform a forward trace operation", () => {});

  /**
   * Given a historical point for a selected activity, locate all preceeding
   * movements that
   */
  test("Validate we can perform a backwards trace operation", () => {});
});
