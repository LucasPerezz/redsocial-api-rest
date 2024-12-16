import path from "path";
import fs from "fs";
import { followUserIds } from "./../services/followUserIds.js";
import { publicationModel } from "./../models/publication.model.js";

export const savePublication = async (req, res) => {
  const params = req.body;

  if (!params.text)
    return res.status(400).send({
      status: "error",
      message: "Debes enviar el texto de la publicacion",
    });

  let newPublication = new publicationModel(params);

  newPublication.user = req.user.id;

  const savePublication = await publicationModel.create(newPublication);

  if (!savePublication)
    return res.status(400).send({
      status: "error",
      message: "No se ha podido guardar la publicacion",
    });

  return res.status(200).send({
    status: "success",
    publication: newPublication,
  });
};

export const publicationDetail = async (req, res) => {
  const id = req.params.id;

  const publication = await publicationModel.findById(id);

  if (!publication)
    return res.status(404).send({
      status: "error",
      message: "No existe la publicion",
    });

  return res.status(200).send({
    status: "success",
    publication,
  });
};

export const removePublication = async (req, res) => {
  const publicationId = req.params.id;

  const publication = await publicationModel.findOneAndDelete({
    user: req.user.id,
    _id: publicationId,
  });

  if (!publication) {
    return res.status(404).send({
      status: "error",
      message: "No se ha encontrado la publicacion",
    });
  }

  return res.status(200).send({
    status: "success",
    message: "La publicacion fue eliminada",
  });
};

export const publicationsOfTheUser = async (req, res) => {
  const userId = req.params.id;
  let page = req.params.page || 1;

  const itemsPerPage = 5;

  const publications = await publicationModel
    .find({
      user: userId,
    })
    .sort("-created_at")
    .populate("user", "-password -__v -role -email")
    .paginate(page, itemsPerPage);

  if (!publications) {
    return res.status(404).send({
      status: "error",
      message: "No se han encontrado publicaciones",
    });
  }

  const total = await publicationModel.find({
    user: userId,
  }).length;

  return res.status(200).send({
    status: "error",
    user: req.user,
    publications,
    total,
    page,
    pages: Math.ceil(total / itemsPerPage),
  });
};

export const uploadFile = async (req, res) => {
  const publicationId = req.params.id;

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

  const publicationUpdated = await publicationModel.findOneAndUpdate(
    {
      user: req.user.id,
      _id: publicationId,
    },
    { file: req.file.filename },
    { new: true }
  );

  if (!publicationUpdated) {
    return res.status(500).send({
      status: "error",
      message: "Error en la subida del archivo",
    });
  }

  return res.status(200).send({
    status: "success",
    publication: publicationUpdated,
    file: req.file,
  });
};

export const showPublicationImage = async (req, res) => {
  const file = req.params.file;

  const filePath = `./uploads/publications/${file}`;

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

export const feed = async (req, res) => {
  let page = req.params.page || 1;
  let itemsPerPage = 5;

  try {
    const myFollows = await followUserIds(req.user.id);

    const publications = await publicationModel
      .find({
        user: myFollows.following_clean,
      })
      .populate("user")
      .sort("-created_at")
      .select("-password -email -__v -role")
      .paginate(page, itemsPerPage);

    const total = await publicationModel.countDocuments({
      user: myFollows.following_clean,
    });

    return res.status(200).send({
      status: "success",
      following: myFollows.following_clean,
      total: publications.length,
      page,
      pages: Math.ceil(total / itemsPerPage) || 1,
      publications: publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "No se han listado las publicaciones del feed",
    });
  }
};
