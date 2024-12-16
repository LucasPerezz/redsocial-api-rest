import { Router } from "express";
import {
  counters,
  getUser,
  getUsers,
  login,
  pruebaUser,
  register,
  showAvatar,
  updateUser,
  uploadFIle,
} from "./../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";
import multer from "multer";

const userRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

userRouter.get("/prueba", auth, pruebaUser);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile/:id", auth, getUser);
userRouter.get("/list/:page?", auth, getUsers);
userRouter.put("/update", auth, updateUser);
userRouter.post("/upload", [auth, uploads.single("file0")], uploadFIle);
userRouter.get("/avatar/:file", showAvatar);
userRouter.get("/counters/:id", auth, counters);

export default userRouter;
