import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await argon2.hash(password)
    return hashedPassword
}


export const verifyPassword = async (storedHash: string, submittedPassowrd: string): Promise<boolean> => {
    const isPasswordTrue = await argon2.verify(storedHash, submittedPassowrd)
    return isPasswordTrue
}