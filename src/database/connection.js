import mongoose from "mongoose";
import { config } from "../../config/config.js";

export const connection = async () => {
    try {
        await mongoose.connect(config.databaseUrl)
        console.log('La base de datos se conecto correctamente')
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}