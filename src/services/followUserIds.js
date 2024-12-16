import followModel from "../models/follow.model.js";

export const followUserIds = async (identityUserId) => {
  try {
    let following = await followModel
      .find({
        user: identityUserId,
      })
      .select({ followed: 1, _id: 0 });

    let followers = await followModel
      .find({
        followed: identityUserId,
      })
      .select({ user: 1, _id: 0 });

    let following_clean = [];

    following.forEach((follow) => {
      following_clean.push(follow.followed);
    });

    let followers_clean = [];

    followers.forEach((follower) => {
      followers_clean.push(follower.user);
    });

    return {
      following_clean,
      followers_clean,
    };
  } catch (error) {
    return {};
  }
};

export const followThisUser = async (identityUserId, profileUserId) => {
  let following = await followModel.findOne({
    user: identityUserId,
    followed: profileUserId,
  });

  let follower = await followModel.find({
    followed: identityUserId,
    user: profileUserId,
  });

  return {
    following,
    follower,
  };
};
