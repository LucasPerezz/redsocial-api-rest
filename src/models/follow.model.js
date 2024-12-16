import { Schema, model } from "mongoose";

const FollowSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  followed: {
    type: Schema.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const followModel = model("Follow", FollowSchema);

export default followModel;
