import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { publicationRouter } from "./src/routes/publication.js";
import { followRouter } from "./src/routes/follow.js";
import { connection } from "./src/database/connection.js";
import userRouter from "./src/routes/user.js";
import { config } from "./config/config.js";

dotenv.config();

const app = express();
const port = config.port | 3900;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connection();

app.use("/api/v1/users", userRouter);
app.use("/api/v1/publications", publicationRouter);
app.use("/api/v1/follows", followRouter);

app.get("/", (req, res) => {
  res.json("Hola mundo");
});

app.listen(port, () => {
  console.log(`Escuchando puerto ${port}`);
});
