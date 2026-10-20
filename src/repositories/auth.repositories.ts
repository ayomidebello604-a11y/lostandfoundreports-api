import { pool } from "../db/index.ts";
import { type RegisterInput, type LoginInput } from "../schema/auth.schema.ts";
export type dbRegister = Omit<RegisterInput, "password"> & {
     password_hash: string
}
export interface dbLogin extends dbRegister {
    id: string
}
type users = safeRegister[]
type safeRegister = Omit<dbRegister, "password_hash"> 

export const fetchAllUsers = async (): Promise<users> => {
    const users = await pool.query<safeRegister>("SELECT id,name,email FROM users")
    return users.rows
}

export const createUser = async (input: dbRegister): Promise<safeRegister | null> => {
    const { name, email, password_hash } = input
    const text = "INSERT INTO users (name,email,password_hash) VALUES($1,$2,$3) RETURNING name,email"
    const value = [name, email, password_hash]
    const newUser = await pool.query<safeRegister>(text, value);
    return newUser.rows[0] ?? null
} 

export const findUserByEmail = async (email: string) : Promise<dbLogin | null> => {
    const text = "SELECT * FROM users WHERE email=$1"
    const value = [email]
    const user = await pool.query<dbLogin>(text, value)
    return user.rows[0] ?? null
}
