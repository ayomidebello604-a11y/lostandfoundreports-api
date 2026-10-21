import { pool } from "../db/index.ts";
import type { Report, NewReportInput } from "../types/reports.types.ts";
type reports = Report[]
type paginatedReportsdata = {
    paginatedReports: reports,
    totalReports: number,
    totalPages:number
}
interface ReportWithUserid extends Report {
  user_id: string
}

 export const postReport = async (userId:string,input: NewReportInput): Promise<ReportWithUserid | null> => {
    const {
      student_id,
      item_name,
      description,
      type,
      category,
      location,
      contact_details,
    } = input

    const text = "INSERT INTO lost_found_reports(user_id,student_id,item_name,description,type,category,location,contact_details) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *"
    const value = [userId,student_id, item_name, description, type, category, location, contact_details ?? null]
    const NewTable = await pool.query<ReportWithUserid>(text, value)
     return NewTable.rows[0] ?? null;
    }

export const fetchAllReports = async (): Promise<reports> => {
    const allReports = await pool.query<Report>("SELECT * FROM lost_found_reports ORDER BY id ASC")
    return allReports.rows;
}

export const fetchReportById = async (id: number): Promise<Report | null> => {
    const text = "SELECT * FROM lost_found_reports WHERE id=$1"
    const value = [id]
    const foundReport = await pool.query<Report>(text, value)
    return foundReport.rows[0] ?? null
}

export const putReport = async (input: NewReportInput,id:number,userId:string ): Promise<Report | null> => {
    const {
      student_id,
      item_name,
      description,
      type,
      category,
      location,
      contact_details,
    } = input;
    const text = "UPDATE lost_found_reports SET student_id=$1, item_name=$2, description=$3, type=$4, category=$5, location=$6,contact_details=$7 WHERE id=$8 AND user_id=$9 RETURNING *"
    const value = [student_id,item_name,description,type,category,location,contact_details, id,userId]
    const updatedTable = await pool.query<Report>(text, value)
    return updatedTable.rows[0] ?? null
} 

export const removeReport = async (
  id: number,
  userId: string,
  userRole: "student" | "admin",
): Promise<Report | null> => {
  const text =
    userRole === "admin"
      ? "DELETE FROM lost_found_reports WHERE id=$1 RETURNING *"
      : "DELETE FROM lost_found_reports WHERE id=$1 AND user_id=$2 RETURNING *";

  const value = userRole === "admin" ? [id] : [id, userId];

  const response = await pool.query<Report>(text, value);

  return response.rows[0] ?? null;
};

export const fetchLostReports = async (): Promise<reports> => {
    const text = "SELECT * FROM lost_found_reports WHERE type='lost' ORDER BY id ASC" 
    const reports = await pool.query<Report>(text)
    return reports.rows 
}

export const fetchFoundReports = async (): Promise<reports> => {
  const text = "SELECT * FROM lost_found_reports WHERE type='found' ORDER BY id ASC";
  const reports = await pool.query<Report>(text);
  return reports.rows;
};
export const fetchReportsByItemName = async (
  searchTerm: string,
): Promise<reports> => {
  const text = `
    SELECT * FROM lost_found_reports 
    WHERE item_name ILIKE $1 
    ORDER BY id ASC;
  `;

 
  const values = [`%${searchTerm}%`];

  const result = await pool.query<Report>(text, values);
  return result.rows;
};

export const getPaginatedReports = async (limit:number,page: number): Promise<paginatedReportsdata> => {
    const offset = (page - 1) * limit
    const text =
      "SELECT * FROM lost_found_reports  ORDER BY id ASC LIMIT $1 OFFSET $2";
    const value = [limit,offset]
    const paginatedReports = (await pool.query<Report>(text,value)).rows
    const count = await pool.query("SELECT COUNT(*) FROM lost_found_reports")
    const totalReports = Number(count.rows[0].count) 
    const totalPages = Math.ceil(totalReports / limit)
    return {
        paginatedReports,
        totalReports,
        totalPages
    }
}
