import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import {
  feed,
  publicationDetail,
  removePublication,
  savePublication,
  showPublicationImage,
  uploadFile,
} from "./../controllers/publication.controller.js";
import multer from "multer";

export const publicationRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/publications");
  },
  filename: (req, file, cb) => {
    cb(null, "pub-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

publicationRouter.post("/save", auth, savePublication);
publicationRouter.get("/detail/:id", auth, publicationDetail);
publicationRouter.delete("/remove/:id", auth, removePublication);
publicationRouter.get("/user/:id/:page?", auth, publicationDetail);
publicationRouter.post(
  "/upload/:id",
  [auth, uploads.single("file0")],
  uploadFile
);
publicationRouter.get("/media/:file", showPublicationImage);
publicationRouter.get("/feed/:page?", auth, feed);
