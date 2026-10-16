type reportType = "lost" | "found"
 type itemStatus = "open" | "claimed" | "returned" | "closed"

export interface Report{
    id: number
    student_id: string,
    item_name: string,
    description: string,
    type: reportType,
    category: string,
    location: string,
    status: itemStatus,
    contact_details?: string | null
}

export type NewReportInput = Omit<
  Report,
  "id" | "status"
>
