import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import mongoosePagination from "mongoose-pagination";
import { createToken } from "./../services/jwt.js";
import { followUserIds } from "./../services/followUserIds.js";
import { followThisUser } from "./../services/followUserIds.js";
import followModel from "./../models/follow.model.js";
import userModel from "./../models/user.model.js";
import { publicationModel } from "./../models/publication.model.js";

export const pruebaUser = async (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Prueba exitosa",
  });
};

export const register = async (req, res) => {
  try {
    let params = req.body;

    if (!params.name || !params.email || !params.password || !params.nick) {
      console.log("VALIDACIÓN INCORRECTA");
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar",
      });
    }

    let userToSave = new userModel(params);

    const existingUsers = await userModel.find({
      $or: [
        { email: userToSave.email.toLowerCase() },
        { nick: userToSave.nick.toLowerCase() },
      ],
    });

    if (existingUsers.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(userToSave.password, 10);
    userToSave.password = hashedPassword;

    const userStored = await userToSave.save();

    return res.status(200).json({
      status: "success",
      message: "Se registró exitosamente el usuario",
      user: userStored,
    });
  } catch (err) {
    console.error("Error en el registro:", err);
    return res.status(500).json({
      status: "error",
      message: "Ocurrió un error al procesar la solicitud",
    });
  }
};

export const login = async (req, res) => {
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  const user = await userModel.findOne({ email: params.email });

  if (!user)
    return res
      .status(404)
      .send({ error: "error", message: "No se ha encontrado ningun usuario" });

  const pdw = await bcrypt.compare(params.password, user.password);

  if (!pdw) {
    return res.status(400).send({
      status: "error",
      message: "contrasena incorrecta",
    });
  }

  const token = createToken(user);

  return res.status(200).send({
    status: "success",
    message: "Login realizado exitosamente",
    user: {
      name: user.name,
      nick: user.nick,
      id: user._id,
    },
    token,
  });
};

export const getUser = async (req, res) => {
  const id = req.params.id;

  const user = await userModel.findById(id).select({ role: 0, password: 0 });

  if (!user) {
    return res.status(404).send({
      status: "error",
      message: "No se ha encontrado el usuario",
    });
  }

  const followInfo = await followThisUser(req.user.id, id);

  return res.status(200).send({
    status: "success",
    user,
    following: followInfo.following,
    follower: followInfo.follower,
  });
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const itemsPerPage = 2;

    const users = await userModel
      .find()
      .select("-password -email -role -__v")
      .sort("_id")
      .paginate(page, itemsPerPage);

    console.log(users);

    if (!users || users.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay usuarios disponibles",
      });
    }

    const followUsers = await followUserIds(req.user.id);

    const total = (await userModel.find()).length;

    return res.status(200).send({
      status: "success",
      page,
      itemsPerPage,
      total,
      pages: Math.ceil(total / itemsPerPage),
      users,
      user_following: followUsers.following_clean,
      user_follower: followUsers.followers_clean,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al obtener los usuarios",
    });
  }
};

export const updateUser = async (req, res) => {
  let userIdentity = req.user;
  let userToUpdate = req.body;

  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  const users = await userModel.find({
    $or: [
      { email: userToUpdate.email?.toLowerCase() },
      { nick: userToUpdate.nick?.toLowerCase() },
    ],
  });

  if (!users)
    return res
      .status(404)
      .send({ error: "error", message: "No se ha encontrado ningun usuario" });

  let userIsset = false;

  users.forEach((user) => {
    if (user && user._id != userIdentity.id) {
      userIsset = true;
    }
  });

  if (userIsset) {
    return res.status(200).send({
      status: "error",
      message: "El usuario ya existe",
    });
  }

  if (userToUpdate.password) {
    let pdw = await bcrypt.hash(userToUpdate.password, 10);
    userToUpdate = pdw;
  } else {
    delete userToUpdate.password;
  }

  const userUpdated = await userModel.findByIdAndUpdate(
    {
      _id: userIdentity.id,
    },
    userToUpdate,
    { new: true }
  );

  if (!userUpdated) {
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar usuario",
    });
  }

  return res.status(200).send({
    status: "Success",
    user: userUpdated,
  });
};

export const uploadFIle = async (req, res) => {
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "Peticion no incluye imagen",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;

    const fileDeleted = fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "Extension del fichero invalido",
      fileDeleted,
    });
  }

  const userUpdated = await userModel.findOneAndUpdate(
    {
      _id: req.user.id,
    },
    { image: req.file.filename },
    { new: true }
  );

  if (!userUpdated) {
    return res.status(500).send({
      status: "error",
      message: "Error en la subida del avatar",
    });
  }

  return res.status(200).send({
    status: "success",
    user: userUpdated,
    file: req.file,
  });
};

export const showAvatar = async (req, res) => {
  const file = req.params.file;

  const filePath = `./uploads/avatars/${file}`;

  fs.stat(filePath, (err, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }

    return res.sendFile(path.resolve(filePath));
  });
};

export const counters = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await followModel.countDocuments({ user: userId });
    const followed = await followModel.countDocuments({ followed: userId });
    const publications = await publicationModel.countDocuments({
      user: userId,
    });

    return res.status(200).send({
      userId,
      following,
      followed,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en los contadores",
    });
  }
};
