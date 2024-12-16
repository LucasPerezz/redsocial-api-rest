import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import {
  followers,
  following,
  followUser,
  unfollow,
} from "./../controllers/follow.controller.js";

export const followRouter = Router();

followRouter.get("/following/:id?/:page?", auth, following);
followRouter.get("/followers/:id?/:page?", auth, followers);
followRouter.post("/save", auth, followUser);
followRouter.delete("/unfollow", auth, unfollow);
