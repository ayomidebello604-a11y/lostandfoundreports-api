import { SignJWT } from "jose";
import { AppError } from "../errors/AppError.ts";

type userRole = "student" | "admin"

export const generateToken = async (role:userRole,userId: string): Promise<string> => {

    if (!process.env.JWT_SECRET) {
      throw new AppError("Internal Server Error", 500);
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ role: role})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("20m")
        .sign(secret);
    
    return token
}
