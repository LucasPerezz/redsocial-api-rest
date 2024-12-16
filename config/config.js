import dotenv from "dotenv";

dotenv.config()

export const config = {
    secretKey: process.env.JWT_SECRET_KEY,
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.PORT
}