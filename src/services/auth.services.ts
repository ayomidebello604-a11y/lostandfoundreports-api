import { randomBytes,createHash,randomUUID} from "node:crypto";
import { AppError } from "../errors/AppError.ts";
import { hashPassword, verifyPassword } from "../password.ts";
import { create_Session,RotateRefreshToken ,createUser, fetchAllUsers, findUserByEmail, findUserById, revokeRefreshToken, searchToken } from "../repositories/auth.repositories.ts";
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
//For Login,Accesstoken,RefreshToken and Session creation
export const verifyUserService = async (input: LoginInput) => {
    const user = await findUserByEmail(input.email)
    if (!user) {
        throw new AppError("Invalid email or password",401)
    };
    const isPasswordValid = await verifyPassword(user.password_hash,input.password);
    if (!isPasswordValid) {
        throw new AppError("invalid email or Password",401)
    }
    const Token = await generateToken(user.role, user.id)
   const session_id = randomUUID();
    const refreshToken = randomBytes(32).toString("hex")
    const hashed_refreshToken = createHash("sha256").update(refreshToken).digest("hex");
    const expires_at = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const session =  await create_Session(user.id, session_id, hashed_refreshToken, expires_at)
    if (!session) {
        throw new AppError("Unable to Create session",500)
    }
    
    const userDetails = {
        user_id: user.id,
       email: user.email,
        name: user.name,
        accessToken: Token,
        refreshToken: refreshToken,
       expires_at: expires_at
    };
    return  userDetails
    
};



//For new AccessToken Creation and RefreshToken Rotation

export const verifyTokenService = async (refreshToken: string) => {
    const token_hash = createHash("sha256").update(refreshToken).digest("hex")
    const token_info =  await searchToken(token_hash)
    if (!token_info) {
        throw new AppError("Unable to find corresponding token", 401)
    }
    const userId = token_info.user_id;
    const user = await findUserById(userId)
    if (!user) {
        throw new AppError("Unable to find User",404)
    }
    const new_access_token = await generateToken(user.role, userId);
    const new_refresh_token = randomBytes(32).toString("hex");
    const new_refresh_token_hash = createHash("sha256").update(new_refresh_token).digest("hex");
    const sessionId = token_info.session_id;
    const expires_at = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await RotateRefreshToken(token_hash, new_refresh_token_hash, expires_at);
    const session_info = {
        sessionId: sessionId,
       new_accessToken: new_access_token,
        refreshToken: new_refresh_token,
        expiresAt: expires_at
    };
    return session_info
}

export const logoutService = async (refreshToken: string) => {
    const hashed_token = createHash("sha256").update(refreshToken).digest("hex")
    const isLogout = await revokeRefreshToken(hashed_token)
    if (!isLogout) {
        throw new AppError("Unable to Logout User",401)
    }
    return isLogout
}
