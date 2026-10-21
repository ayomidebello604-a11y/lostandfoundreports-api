import { type Request, type Response, type NextFunction } from "express";
import {
  createReportService,
  deleteReportService,
  getAllReportsService,
    getLostReportsService,
  getFoundReportsService,
  getReportByIdService,
  updateReportService,
  searchReportsByItemNameService,
  getPaginatedReportsService,
} from "../services/lostfound.services.ts";
import { AppError } from "../errors/AppError.ts";

export const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.validatedBody) {
       throw new AppError("Validated request body is missing", 400);
    }
    const newReport = await createReportService(req.userId,req .validatedBody);
    res.status(201).json(newReport);
  } catch (error) { 
    next(error);
  }
};
export const getAllReports = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const allReports = await getAllReportsService();
    res.status(200).json(allReports);
  } catch (error) {
    next(error);
  }
};
export const getReportById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
      const id = Number(req.params.id);
       if (!Number.isInteger(id) || id < 1) {
         throw new AppError("Invalid report ID", 400);
       }
    const report = await getReportByIdService(id);
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};
export const updateReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const updatedReport = await updateReportService(req.body, id,req.userId);
    res.status(200).json(updatedReport);
  } catch (error) {
    next(error);
  }
};
export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
      const id = Number(req.params.id);
       if (!Number.isInteger(id) || id < 1) {
         throw new AppError("Invalid report ID", 400);
       }
        const deletedReport = await deleteReportService(id,req.userId,req.userRole);
    res.status(200).json(deletedReport);
  } catch (error) {
    next(error);
  }
};
export const getLostReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lostReports = await getLostReportsService();
    res.status(200).json(lostReports);
  } catch (error) {
    next(error);
  }
};
export const getFoundReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const foundReports = await getFoundReportsService();
    res.status(200).json(foundReports);
  } catch (error) {
    next(error);
  }
};
export const getReportsBySearchName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchName = String(req.query.searchName)  
        if (typeof searchName !== "string" || searchName.trim() === "") {
          throw new AppError(
            "Search name must be provided as a non-empty string",
            400,
          );
        }
        const fetchedReports = await searchReportsByItemNameService(searchName);
        res.status(200).json(fetchedReports)
    } catch (error) {
        next(error)
}
}
export const getPaginatedReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.validatedQuery) {
        throw new AppError("Requested Query expected",400)
      }
          const { limit, page } = req.validatedQuery
        const paginatedReports =  await getPaginatedReportsService(limit,page)
        res.status(200).json({
            Message: "Paginated Reports Fetched",
            page: page,
            totalPages: paginatedReports.totalPages,
            Limit: limit,
            TotalReport: paginatedReports.totalReports,
            Reports : paginatedReports.paginatedReports
        })
    } catch (error) {
        next(error)
}
}
