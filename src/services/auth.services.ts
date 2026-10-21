import { AppError } from "../errors/AppError.ts";
import { hashPassword, verifyPassword } from "../password.ts";
import { createUser, fetchAllUsers, findUserByEmail, type dbRegister } from "../repositories/auth.repositories.ts";
import type { LoginInput, RegisterInput } from "../schema/auth.schema.ts";
import { generateToken } from "../utils/jwt.ts";

export const getAllUsersService = async () => {
    const response = await fetchAllUsers()
    return response
}

export const registerUserService = async (input: RegisterInput) => {
    const password_hash = await hashPassword(input.password)
    const argument = {
        name: input.name,
        email: input.email,
        password_hash
    }
    const response = await createUser(argument)
    if (!response) {
        throw new AppError("Internal server Error",500)
    }
    return response
}

export const verifyUserService = async (input: LoginInput) => {
    const user = await findUserByEmail(input.email)
    if (!user) {
        throw new AppError("Invalid email or password",401)
    };
    const isPasswordValid = await verifyPassword(user.password_hash,input.password);
    if (!isPasswordValid) {
        throw new AppError("invalid email or Password",401)
    }
    const Token = await generateToken(user.role,user.id)
    const userDetails = {
        user_id: user.id,
       email: user.email,
        name: user.name,
       Token: Token
     };
    return  userDetails
    
};