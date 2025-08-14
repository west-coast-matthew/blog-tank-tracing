/**
 * Test battery for operations related to inventory tracking.
 * Since we are focusing on tracing operations, we mock the
 * data used to model activity.
 */

import { ActivityModel } from "@/services/entity-load-service";
import {
  getInMemoryStore,
  initInMemoryStructure,
  traceBackwards,
} from "@/services/inv-tracking-service";
import { loadMockActivityGraph } from "../mock/mock-utils";
import Tank from "@/models/tank.model";
import Movement from "@/models/movement.model";
import MovementSegment from "@/models/movement-segment.model";

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

  /**
   * 'Tracing backwards' is an recusrive process where we need to identify
   * the first movement in a series of related operations. A necessary
   * step in the process of identifying movement sequences.
   */
  describe("Ensure we can execute backwards tracing successfully", () => {
    /* 
      Let's supply a movement that has the same tank on each side of 
      the movement (not an actual movement), for which there is no 
      previous movement, which represents the initial movement. 
    */
    test("Validate no previous movment state scenario", () => {
      const tank100: Tank = new Tank();
      tank100.id = 100;

      const mvmnt: Movement = new Movement();
      mvmnt.id = 1;

      let srcMvmnt, destMvmnt: MovementSegment;
      srcMvmnt = new MovementSegment();
      srcMvmnt.tank = tank100;
      destMvmnt = new MovementSegment();
      destMvmnt.tank = tank100;

      mvmnt.source = srcMvmnt;
      mvmnt.dest = destMvmnt;

      const result: Movement = traceBackwards(100, mvmnt);
      expect(result).toBeTruthy();
      expect(result.id).toEqual(1);
    });

    /*
      Now will supply a movement that does has a previous movement, 
      however the initial referenced movement represents somthing going 
      into an empty tank, in which case the initial movment supplied 
    */
    test("Validate scenario where initial movement referenced was into empty tank", () => {
      /* 
        So we still stage a movment into tank 100, which was previously 
        empty, for which which a previous movement exists. In this case since
        something went into an empty tank, so the previous activity is considered 
        unrelated to the current movement series.

        200-->300 what happend previously, where the tank had previouosly emptied
        100-->200 (this is the movement supplied to the trace method)

      */

      const tank100: Tank = new Tank();
      tank100.id = 100;

      const tank200: Tank = new Tank();
      tank200.id = 200;

      const tank300: Tank = new Tank();
      tank300.id = 300;

      const mvmnt: Movement = new Movement();
      mvmnt.id = 2;

      let srcMvmnt, destMvmnt: MovementSegment;
      srcMvmnt = new MovementSegment();
      srcMvmnt.tank = tank100;
      srcMvmnt.previousGallons = 100;
      srcMvmnt.afterGallons = 50;
      destMvmnt = new MovementSegment();
      destMvmnt.tank = tank200;
      destMvmnt.previousGallons = 0;
      destMvmnt.afterGallons = 50;

      mvmnt.source = srcMvmnt;
      mvmnt.dest = destMvmnt;

      // Stage previous activity
      const prevMvmnt = new Movement();
      prevMvmnt.id = 1;
      let prevSrcMvmnt, prevDestMvmnt: MovementSegment;
      prevSrcMvmnt = new MovementSegment();
      prevDestMvmnt = new MovementSegment();
      prevSrcMvmnt.id = 3;
      prevDestMvmnt.id = 4;
      prevSrcMvmnt.tank = tank200;
      prevDestMvmnt.tank = tank300;
      prevSrcMvmnt.previousGallons = 500;
      prevDestMvmnt.previousGallons = 100;
      prevSrcMvmnt.afterGallons = 500;
      prevDestMvmnt.afterGallons = 0;
      prevMvmnt.source = prevSrcMvmnt;
      prevMvmnt.dest = prevDestMvmnt;
      prevSrcMvmnt.movement = prevMvmnt;
      prevDestMvmnt.movement = prevMvmnt;
      // And finally for the movement we are submitting to the target,
      // establish references to the previous 'thing' that happened.
      // As of 7/13/2025, this is a manual and confusing process (duly noted)
      // I need to take a break and explore a better DSL based approach
      // towards this, in the interest of timeboxing efforts, I am releasing
      // with this approach...
      destMvmnt.prevMvmnt = prevSrcMvmnt;
      prevSrcMvmnt.nextMvmnt = destMvmnt;

      // todo: setup hl references for all hls
      const result: Movement = traceBackwards(200, mvmnt);
      expect(result).toBeTruthy();
      expect(result.id).toEqual(1);
    });
  });
});

/**
 *
 */
const getActivitySequenceScenario1 = (): Array<Movement> => {
  // Define mock tanks
  let tank100, tank101, tank102, tank103, tank104: Tank;
  tank100 = new Tank();
  tank100.id = 100;
  tank101 = new Tank();
  tank101.id = 101;
  tank102 = new Tank();
  tank102.id = 102;
  tank103 = new Tank();
  tank103.id = 103;
  tank104 = new Tank();
  tank104.id = 103;

  return [];
};
