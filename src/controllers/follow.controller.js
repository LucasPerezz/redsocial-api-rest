import mongoosePagination from "mongoose-pagination";

import { followThisUser } from "./../services/followUserIds.js";
import { followUserIds } from "./../services/followUserIds.js";
import followModel from "./../models/follow.model.js";
import userModel from "./../models/user.model.js";

export const followUser = async (req, res) => {
  const params = req.body;

  const identity = req.user;

  let userToFollow = new followModel({
    user: identity.id,
    followed: params.followed,
  });

  const followUser = await followModel.create(userToFollow);

  if (!followUser) {
    res.status(400).send({
      status: "error",
      message: "Error al seguir un usuario",
    });
  }

  return res.status(200).send({
    status: "success",
    identity: req.user,
    follow: followUser,
  });
};

export const unfollow = async (req, res) => {
  const userId = req.user.id;

  const followedId = req.params.id;

  const unfollowUser = await followModel.findOneAndDelete({
    user: userId,
    followed: followedId,
  });

  if (!unfollowUser) {
    return res.status(404).send({
      status: "error",
      message: "No se ha dejado de seguir a nadie",
    });
  }

  return res.status(200).send({
    status: "success",
    message: "Follow eliminado exitosamente",
    identity: req.user,
    unfollowUser,
  });
};

export const following = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) userId = req.params.id;

  let page = 1;

  if (req.params.page) page = req.params.page;

  const itemsPerPage = 5;

  const followersOfUser = await followModel
    .find({
      user: userId,
    })
    .populate("user followed", "-password -role -__v")
    .paginate(page, itemsPerPage);

  if (!followersOfUser) {
    return res.status(404).send({
      status: "error",
      message: "Error al encontrar los seguidores",
    });
  }

  const total = (await followModel.find({ user: userId })).length;

  let followUsers = await followUserIds(req.user.id);

  return res.status(200).send({
    status: "success",
    message: "Listado de usuarios que sigo",
    follows: followersOfUser,
    total,
    pages: Math.ceil(total / itemsPerPage),
    user_following: followUsers.following_clean,
    user_follow_me: followUsers.followers_clean,
  });
};

export const followers = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) userId = req.params.id;

  let page = 1;

  if (req.params.page) page = req.params.page;

  const itemsPerPage = 5;

  const followersOfUser = await followModel
    .find({
      followed: userId,
    })
    .populate("user", "-password -role -__v")
    .paginate(page, itemsPerPage);

  if (!followersOfUser) {
    return res.status(404).send({
      status: "error",
      message: "Error al encontrar los seguidores",
    });
  }

  const total = (await followModel.find({ user: userId })).length;

  let followUsers = await followUserIds(req.user.id);

  return res.status(200).send({
    status: "success",
    message: "Listado de usuarios que me siguen",
    follows: followersOfUser,
    total,
    pages: Math.ceil(total / itemsPerPage),
    user_following: followUsers.following_clean,
    user_follow_me: followUsers.followers_clean,
  });
};
