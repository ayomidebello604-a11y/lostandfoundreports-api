import type {Request,Response, NextFunction } from "express";
import { getAllUsersService, registerUserService, verifyUserService } from "../services/auth.services.ts";
import { AppError } from "../errors/AppError.ts";


export const getAllUsers = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const users = await getAllUsersService();
        res.status(200).json({
            message: "All Users",
            users
        })
    } catch (error) {
        next(error)
  }
}



export const registerUser = async (req:Request, res:Response, next:NextFunction) => {
    try {
        if (!req.validatedRegisterBody) {
            throw new AppError("Validated Request body is Missing",400)
        }
    const user = await registerUserService(req.validatedRegisterBody)
        res.status(201).json({
            message: "User Created",
            user
        })
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.validatedLoginBody) {
            throw new AppError("Validated Request body is missing",400)
        }
        const user = await verifyUserService(req.validatedLoginBody)
        res.status(200).json({
            message: "User Authenticated",
            user
        })
    } catch (error) {
        next(error)
    }
}