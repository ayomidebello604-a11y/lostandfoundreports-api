import type { Request } from "express";
import { type newReportInput,type queryType } from "../schema/lostandfound.schema.ts";

 export type RequestWithValidatedBody = Request & {
    validatedBody: newReportInput
}

export type RequestWithValidatedQuery = Request & {
    validatedQuery : queryType
}
