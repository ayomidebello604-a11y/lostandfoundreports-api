import { type Request, type Response, type NextFunction } from "express";
import * as z from "zod";
import { jwtVerify } from "jose";
import { generateToken } from "../utils/jwt.ts";
import { LoginSchema, RegisterSchema } from "../schema/auth.schema.ts";
import { AppError } from "../errors/AppError.ts";


export const validateRegisterBody = (req: Request, res: Response, next: NextFunction) => {
    const validatedBody = RegisterSchema.safeParse(req.body)
    if (!validatedBody.success) {
        const prettifiedError = z.prettifyError(validatedBody.error)
        return next(new AppError(prettifiedError, 400))
    } else {
        req.validatedRegisterBody = validatedBody.data
        next()
    }
};

export const validateLoginBody = (req: Request, res: Response, next: NextFunction) => {
    const validatedBody = LoginSchema.safeParse(req.body)
    if (!validatedBody.success) {
        const prettifiedError = z.prettifyError(validatedBody.error)
        return next(new AppError(prettifiedError,400))
    } else {
        req.validatedLoginBody = validatedBody.data
        next()
    }
}



export const verifyUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization Header needed",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Missing token", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("Missing Environment variable", 500);
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || typeof payload.sub !== "string") {
      throw new AppError("Invalid token payload", 401);
    }

    req.userId = payload.sub;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    
    return next(new AppError("Unverified or Expired Token", 401));
  }
};
