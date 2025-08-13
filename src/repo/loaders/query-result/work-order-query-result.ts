export default interface WorkOrderQueryResult{
        id: number;
        work_order_number: string;
        description?: string;
        notes?: string;
        created_at?: Date;
        updated_at?: Date;
        archived_at?: Date;
        scheduled_start?: Date;
        scheduled_end?: Date;
        actual_start?: Date;
        status_code_id: number;
        op_code_id: number;
}