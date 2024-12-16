import jwt from "jwt-simple";
import moment from "moment";
import { config } from "../../config/config.js";

export const secret = config.secretKey;

export const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, secret);
};
