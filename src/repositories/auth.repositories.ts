import { pool } from "../db/index.ts";
import { type RegisterInput, type LoginInput } from "../schema/auth.schema.ts";
import { AppError } from "../errors/AppError.ts";

export type dbRegister = Omit<RegisterInput, "password"> & {
     password_hash: string
}
export interface dbLogin extends dbRegister {
    id: string
    role: "student" | "admin"
}
export interface session {
    session_id: string,
    expires_at: Date
}
export interface token {
    user_id: string,
    session_id: string,
    token_hash:string
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

export const findUserById = async (id: string): Promise<dbLogin | null> => {
    const text = "SELECT role FROM users WHERE id=$1"
    const value = [id]
    const userRole = await pool.query<dbLogin>(text, value)
    return userRole.rows[0] ?? null
}

export const RotateRefreshToken = async ( token_hash: string, hashed_refreshToken: string, expires_at: Date): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

   const result = await client.query<
      token & {
        expires_at: Date;
        revoked_at: Date | null;
      } >(
      `SELECT user_id, session_id, token_hash, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1
       FOR UPDATE`,
      [token_hash],
    );

    const oldToken = result.rows[0];
  if (!oldToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    
    if (oldToken.revoked_at !== null) {
      throw new AppError("Refresh token has already been revoked", 401);
    }

    if (oldToken.expires_at.getTime() <= Date.now()) {
      throw new AppError("Refresh token has expired", 401);
    }
     await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [token_hash],
    );

    
    await client.query(
      `INSERT INTO refresh_tokens
       (user_id, session_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [oldToken.user_id, oldToken.session_id, hashed_refreshToken, expires_at],
    );
 await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
export const searchToken = async ( token_hash: string): Promise<token | null> => {
  const text = "SELECT user_id,session_id,token_hash FROM refresh_tokens WHERE token_hash=$1 AND expires_at > NOW() AND revoked_at IS NULL";
  const value = [token_hash];
  const token_info = await pool.query<token>(text, value);
  return token_info.rows[0] ?? null;
};
export const revokeRefreshToken = async (token_hash: string): Promise<boolean> => {
  const text =
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL";
 const result = await pool.query(text, [token_hash]);
return (result.rowCount ?? 0) > 0; //Return true if a row count was changed otherwise return false
};

 export const create_Session = async (user_id: string, session_id: string, hashed_refeshToken: string, expires_at: Date): Promise<session | null> =>  {
    const text = "INSERT INTO refresh_tokens(user_id,session_id,token_hash,expires_at) VALUES($1,$2,$3,$4) RETURNING session_id,expires_at"
    const value = [user_id, session_id, hashed_refeshToken, expires_at]
    const session = await pool.query<session>(text, value)
    return session.rows[0] ?? null
}







