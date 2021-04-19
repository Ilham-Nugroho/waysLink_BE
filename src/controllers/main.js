const { User, Main, Sublink } = require("../../models");
const Joi = require("joi");

const crypto = require("crypto");

const URL = "http://localhost:4000/uploads/";

exports.createMainLink = async (req, res) => {
  try {
    const {
      body: { title, description, links, views, template, image },
      userId,
    } = req;

    // const schema = Joi.object({
    //   title: Joi.string().max(30).required(),
    //   description: Joi.string().max(140).required(),
    //   image: Joi.string().allow(null, ""),
    //   views: Joi.string().allow(null, ""),
    //   template: Joi.string().allow(null, ""),
    //   links: Joi.array()
    //     .items(
    //       Joi.object({
    //         subtitle: Joi.string().max(50).required(),
    //         suburl: Joi.string().max(50).required(),
    //         subimage: Joi.string().allow(null, ""),
    //       })
    //     )
    //     .allow(null, ""),
    // });

    // const { error } = schema.validate(req.body);

    // if (error)
    //   return res.status(400).send({
    //     status: "Joi Error",
    //     message: error.details[0].message,
    //   });

    //--------------------CREATE ---------------------------

    const unique = crypto.randomBytes(3).toString("hex");

    const createMain = await Main.create({
      title,
      description,
      image: req.files.image[0].filename,
      views: 0,
      likes: 0,
      template,
      uniquelink: unique,
      userId: req.userId.id,
    });

    const linksParse = JSON.parse(links);

    const newImageArray = req.files.image.slice(1, req.files.image.length);

    const createSublink = await Sublink.bulkCreate(
      linksParse.map((data, index) => ({
        subtitle: data.subtitle,
        suburl: data.suburl,
        subimage: `${URL}${newImageArray?.[index]?.filename}`,
        mainId: createMain.id,
      }))
    );

    //-------------------- FIND ---------------------------
    const mainLink = await Main.findOne({
      where: {
        id: createMain.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "UserId"],
      },
      include: {
        model: User,
        as: "user",
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      },
    });

    const linksByMain = await Sublink.findAll({
      where: {
        mainId: mainLink.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "MainId", "mainId"],
      },
    });

    //-------------------- STRINGIFY ---------------------------
    const mainString = JSON.stringify(mainLink);
    const mainObject = JSON.parse(mainString);

    const toRespondMain = {
      ...mainObject,
      image: `${URL}${mainObject?.image}`,
      // image: URL + mainObject.image,
    };

    const sublinkString = JSON.stringify(linksByMain);
    const sublinkObject = JSON.parse(sublinkString);

    // const toRespondSublink = {
    //   ...sublinkObject,
    //   subimage: `${URL}${sublinkObject.subimage}`,
    // };

    res.send({
      status: "success",
      message: "ADD Product Successfull",
      data: {
        link: toRespondMain,
        links: sublinkObject,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.createSublink = async (req, res) => {
  const {
    body: { links, mainId },
  } = req;
  try {
    const theLinks = JSON.parse(links);
    console.log(theLinks);

    const makeSublink = await Sublink.bulkCreate(
      theLinks.map((data) => ({
        subtitle: data.subtitle,
        suburl: data.suburl,
        subimage: data.subimage,
        // subimage: data.subimage,
        mainId: mainId,
      }))
    );

    const findSublink = await Sublink.findAll({
      where: {
        mainId: mainId,
      },
    });

    const subString = JSON.stringify(findSublink);
    const subObject = JSON.parse(subString);

    // const toRespondMain = {
    //   ...subObject,
    //   subimage: `${URL}${subObject.subimage}`,
    //   // image: URL + mainObject.image,
    // };

    res.send({
      status: "success",
      message: "ADD Sub Links Successfull",
      data: {
        links: subObject,
        // links: sublinkObject,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.getUserMainLinkByUnique = async (req, res) => {
  const { unique } = req.params;

  try {
    const mainLink = await Main.findOne({
      where: {
        uniquelink: unique,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "UserId"],
      },
      include: {
        model: Sublink,
        as: "sublink",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    });

    //-------------------- STRINGIFY ---------------------------

    const mainString = JSON.stringify(mainLink);
    const mainObject = JSON.parse(mainString);

    const mainLinks = {
      ...mainObject,
      views: mainObject.views + 1,
    };

    const updateViews = await Main.update(mainLinks, {
      where: {
        id: mainLinks.id,
      },
    });

    const withImage = {
      ...mainLinks,
      image: `${URL}${mainLinks.image}`,
      // views: mainObject.views + 1,
    };

    res.send({
      status: "SUCCESS",
      message: "GET Unique Main Link Successful",
      data: {
        link: withImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.getUserMainLinks = async (req, res) => {
  try {
    const mainLink = await Main.findAll({
      where: {
        userId: req.userId.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "UserId"],
      },
      include: {
        model: Sublink,
        as: "sublink",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    });

    //-------------------- STRINGIFY ---------------------------
    const mainString = JSON.stringify(mainLink);
    const mainObject = JSON.parse(mainString);

    const mapMain = mainObject.map((data) => ({
      ...data,
      image: URL + data.image,
    }));

    res.send({
      status: "SUCCESS",
      message: "GET All Main Links By User Successfull",
      data: {
        link: mapMain,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.editUnique = async (req, res) => {
  try {
    const {
      body: { title, description, sublink, views, template, image },
      userId,
    } = req;
    const { unique } = req.params;

    // const schema = Joi.object({
    //   title: Joi.string().max(30).required(),
    //   description: Joi.string().max(140).required(),
    //   image: Joi.string().allow(null, ""),
    //   views: Joi.string().allow(null, ""),
    //   template: Joi.string().allow(null, ""),
    //   links: Joi.array()
    //     .items(
    //       Joi.object({
    //         subtitle: Joi.string().max(50).required(),
    //         suburl: Joi.string().max(50).required(),
    //         subimage: Joi.string().allow(null, ""),
    //       })
    //     )
    //     .allow(null, ""),
    // });

    // const { error } = schema.validate(req.body);

    // if (error)
    //   return res.status(400).send({
    //     status: "Joi Error",
    //     message: error.details[0].message,
    //   });

    //--------------------UPDATE ---------------------------

    const findUnique = await Main.findOne({
      where: {
        uniquelink: unique,
      },
    });

    const updateMain = await Main.update(
      {
        title,
        description,
        image: req.files.image[0].filename,
      },
      {
        where: {
          uniquelink: unique,
        },
      }
    );

    const linksParse = JSON.parse(sublink);

    console.log(linksParse);

    const newImageArray = req.files.image.slice(1, req.files.image.length);

    const deleteSublink = await Sublink.destroy({
      where: {
        mainId: findUnique.id,
      },
    });

    const updateSublink = await Sublink.bulkCreate(
      linksParse.map((data, index) => ({
        subtitle: data.subtitle,
        suburl: data.suburl,
        subimage: `${URL}${newImageArray?.[index]?.filename}`,
        mainId: findUnique.id,
      }))
      // {
      //   where: {
      //     mainId: findUnique.id,
      //   },
      // }
    );

    //-------------------- FIND ---------------------------
    const mainLink = await Main.findOne({
      where: {
        uniquelink: unique,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "UserId"],
      },
      include: {
        model: User,
        as: "user",
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      },
    });

    const linksByMain = await Sublink.findAll({
      where: {
        mainId: mainLink.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "MainId", "mainId"],
      },
    });

    //-------------------- STRINGIFY ---------------------------
    const mainString = JSON.stringify(mainLink);
    const mainObject = JSON.parse(mainString);

    const toRespondMain = {
      ...mainObject,
      image: `${URL}${mainObject?.image}`,
      // image: URL + mainObject.image,
    };

    const sublinkString = JSON.stringify(linksByMain);
    const sublinkObject = JSON.parse(sublinkString);

    // const toRespondSublink = {
    //   ...sublinkObject,
    //   subimage: `${URL}${sublinkObject.subimage}`,
    // };

    res.send({
      status: "success",
      message: "ADD Product Successfull",
      data: {
        link: toRespondMain,
        links: sublinkObject,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { unique } = req.params;
    const checkId = await Main.findOne({
      where: {
        uniquelink: unique,
      },
    });

    if (!checkId)
      return res.send({
        status: "Not Found",
        message: `Product with id: ${unique} not found`,
      });

    await Main.destroy({
      where: {
        uniquelink: unique,
      },
    });
    res.send({
      status: "success",
      message: "DELETE Product Successfull",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.updateLike = async (req, res) => {
  const { unique } = req.params;

  try {
    const findMain = await Main.findOne({
      where: {
        uniquelink: unique,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    const mainStringify = JSON.stringify(findMain);
    const mainParse = JSON.parse(mainStringify);

    const newLikes = {
      ...mainParse,
      likes: mainParse.likes + 1,
    };

    const addLike = await Main.update(newLikes, {
      where: {
        uniquelink: unique,
      },
    });

    const withImage = {
      ...newLikes,
      image: `${URL}${addLike.image}`,
    };

    res.send({
      status: "SUCCESS",
      message: "Update Likes Main Link Successful",
      data: {
        link: withImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};
