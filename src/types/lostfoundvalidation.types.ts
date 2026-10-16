import type { Request } from "express";
import { type newReportInput,type queryType } from "../zodtest.ts";

 export type RequestWithValidatedBody = Request & {
    validatedBody: newReportInput
}

export type RequestWithValidatedQuery = Request & {
    validatedQuery : queryType
}
