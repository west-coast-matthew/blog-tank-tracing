/**
 * MovementSummary
 *
 * A denormalized (flattened) set of information that summarizes something
 * that happened, which includes references to 'previous' and 'next'
 * events in the chain.
 *
 * So for example, given a reference to an event in a series of events that
 * have occured between the time a tank was initially empty, and the time
 * it resumed an empty state again, a linked list of events represented by
 * this object would be established.
 *
 */
export interface MovementSumary {
  workOrderId: number;
  workOrderNumbr: string;
  completionDate: Date;
  validationDate?: Date;
  movementId: number;
  sourceTankId: number;
  sourceTankName: string;
  destTankName: string;
  destTankId: number;
  origRequestGallons: number;
  sourceBeforeGallons: number;
  sourceAfterGallons: number;
  destBeforeGallons: number;
  destAfterGallons: number;
  prevActivity: MovementSumary;
  nextActivity: MovementSumary;
}
