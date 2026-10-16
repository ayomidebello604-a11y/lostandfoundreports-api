import type { Request, Response, NextFunction } from "express";
import * as z from "zod"
import { Report , PaginationQuery} from "../zodtest.ts";
import { AppError } from "../errors/AppError.ts";
import type { RequestWithValidatedBody,RequestWithValidatedQuery } from "../types/lostfoundvalidation.types.ts";



export const validateReportInput = (req: Request, res: Response, next: NextFunction) => {
    const newReport = Report.safeParse(req.body)
    if (!newReport.success) {
        const prettifiedError = z.prettifyError(newReport.error)
        return next(new AppError(prettifiedError,400))
} else {
        (req as RequestWithValidatedBody).validatedBody  = newReport.data
        next()
    }
}

export const validatePaginationQuery = (req: Request, res: Response, next: NextFunction) => {
    const validatedQuery = PaginationQuery.safeParse(req.query)
    if (!validatedQuery.success) {
        const prettifiedError = z.prettifyError(validatedQuery.error)
        return next(new AppError(prettifiedError,400))
    } else {
        (req as RequestWithValidatedQuery).validatedQuery = validatedQuery.data
        next()
    }
}
