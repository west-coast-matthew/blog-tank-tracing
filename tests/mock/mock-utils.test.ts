/**
 * An given the amount of logic in the mock-utils utility class for
 * generating mock testing data, let's add in some validation for
 * that logic as well.
 */

import WorkOrder from "@/models/work-order-model";
import { getMockWoEventSequence } from "./mock-utils";
import MovementSegment from "@/models/movement-segment.model";
import Movement from "@/models/movement.model";

describe("We should mock data correctly", () => {
  test("Produce a mock movement sequence correctly", () => {
    const wos: Array<WorkOrder> = getMockWoEventSequence();

    expect(wos).toBeTruthy();
    expect(wos.length).toEqual(4);
    expect(wos[0].movements).toBeTruthy();
    expect(wos[0].id).toEqual(1);
    expect(wos[0].movements?.length).toEqual(1);
    expect(wos[1].movements).toBeTruthy();
    expect(wos[1].id).toEqual(2);
    expect(wos[1].movements?.length).toEqual(1);
    expect(wos[2].movements).toBeTruthy();
    expect(wos[2].id).toEqual(3);
    expect(wos[2].movements?.length).toEqual(1);
    expect(wos[3].movements).toBeTruthy();
    expect(wos[3].id).toEqual(4);
    expect(wos[3].movements?.length).toEqual(1);

    // Let's validate movement segments...
    let mvmntSeg: MovementSegment;
    let mvmnt: Movement | undefined;
    mvmnt = wos[0].movements?.at(0);
    expect(mvmnt?.source).toBeTruthy();
    expect(mvmnt?.dest).toBeTruthy();
    expect(mvmnt?.source?.prevMvmnt).toBeFalsy();
    expect(mvmnt?.dest?.nextMvmnt).toBeTruthy();

    mvmnt = wos[1].movements?.at(0);
    expect(mvmnt?.source).toBeTruthy();
    expect(mvmnt?.dest).toBeTruthy();
    expect(mvmnt?.dest?.nextMvmnt).toBeTruthy();
    expect(mvmnt?.dest?.prevMvmnt).toBeTruthy();

    mvmnt = wos[2].movements?.at(0);
    expect(mvmnt?.source).toBeTruthy();
    expect(mvmnt?.dest).toBeTruthy();
    expect(mvmnt?.dest?.nextMvmnt).toBeTruthy();
    expect(mvmnt?.dest?.prevMvmnt).toBeTruthy();

    mvmnt = wos[3].movements?.at(0);
    expect(mvmnt?.source).toBeTruthy();
    expect(mvmnt?.dest).toBeTruthy();
    expect(mvmnt?.source?.prevMvmnt).toBeTruthy();
    expect(mvmnt?.source?.nextMvmnt).toBeFalsy();
  });
});
