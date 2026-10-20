import { SignJWT } from "jose";
import { AppError } from "../errors/AppError.ts";



export const generateToken = async (userId: string): Promise<string> => {

    if (!process.env.JWT_SECRET) {
      throw new AppError("Internal Server Error", 500);
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ role: "student" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("20m")
        .sign(secret);
    
    return token
}
