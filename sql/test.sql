CREATE TABLE refresh_tokens (
    id VARCHAR(20) UNIQUE
    session_id VARCHAR(50) NOT NULL
    user_id INT REFERENCES users(id)  NOT NULL 
   token_hash VARCHAR(150) NOT NULL
   created_at VARCHAR(30)  NOT NULL
   revoked_at VARCHAR(30) NOT NULL
   expires_at VARCHAR(30) NOT NULL
)