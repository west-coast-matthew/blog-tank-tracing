export default interface MovementSegmentQueryResult {
  id: number;
  tank_id: number;
  previous_gallons: number;
  after_gallons: number;
  movement_id: number;
  prev_mvmnt_seg_id?: number;
  next_mvmnt_seg_id?: number;
  created_at: Date;
  updated_at: Date;
}
