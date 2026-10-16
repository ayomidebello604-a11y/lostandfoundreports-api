import { AppError } from "../errors/AppError.ts";
import { fetchAllReports, fetchFoundReports, fetchLostReports, fetchReportById, fetchReportsByItemName, getPaginatedReports, postReport, putReport, removeReport } from "../repositories/lostfound.repositories.ts";
import type { NewReportInput } from "../types/reports.types.ts";

export const createReportService = async (input: NewReportInput) => {
    const response = await postReport(input)
    if (!response) {
        throw new AppError("Response Not Found",404)
    }
    return response
}

export const getAllReportsService = async () => {
    return await fetchAllReports();
}

export const getReportByIdService = async (id: number) => {
    const response =  await fetchReportById(id)
    if (!response) {
        throw new AppError("Unable to fetch a Report with this id",404)
    }
    return response
}

 export const updateReportService = async(input: NewReportInput, id: number) => {
    const response = await putReport(input, id)
    if (!response) {
        throw new AppError("Unable to find the requested reports to be updated", 404)
    }
    return response
}

export const deleteReportService = async (id: number) => {
    const response = await removeReport(id);
    if (!response) {
        throw new AppError("Unable to find the report with the provided id",404)
    }
    return response
}
export const getLostReportsService = async () => {
    const response = await fetchLostReports()
    return response
} 

export const getFoundReportsService = async () => {
    const response = await fetchFoundReports()
    return response
}
export const searchReportsByItemNameService = async (searchTerm: string) => {
    const response = await fetchReportsByItemName(searchTerm)
    return response;
}

export const getPaginatedReportsService = async (limit: number, page: number) => {
    const response = await getPaginatedReports(limit, page)
    return response;
}
