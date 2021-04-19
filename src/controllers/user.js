const { User } = require("../../models");
const Joi = require("joi");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const URL = "http://localhost:5000/uploads/";

exports.registerUser = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    console.log(email);

    const schema = Joi.object({
      email: Joi.string().email().min(10).max(30).required(),
      password: Joi.string().token().min(6).max(40).required(),
      fullName: Joi.string().min(3).max(40).required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res.status(400).send({
        status: "Authentication Failed",
        message: error.details[0].message,
      });

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (checkEmail)
      return res.status(400).send({
        status: "Register failed",
        message: "Email already exist",
      });

    const hashStrength = 10;
    const hashedPassword = await bcrypt.hash(password, hashStrength);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    const secretKey = "thisissecretkey";
    const token = jwt.sign(
      {
        id: user.id,
      },
      secretKey
    );

    res.send({
      status: "success",
      message: "User Succesfully Registered",
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token,
        },
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

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().min(10).max(50).required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res.status(400).send({
        status: "Authentication Failed",
        message: error.details[0].message,
      });

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (!checkEmail)
      return res.status(400).send({
        status: "Login Failed",
        message: "Incorrect Email or Password",
      });

    const isValidPass = await bcrypt.compare(password, checkEmail.password);

    if (!isValidPass) {
      return res.status(400).send({
        status: "Login Failed",
        message: "Incorrect Email or Password",
      });
    }

    const secretKey = "thisissecretkey";
    const token = jwt.sign(
      {
        id: checkEmail.id,
      },
      secretKey
    );

    res.send({
      status: "success",
      message: "Login Success",
      data: {
        user: {
          id: checkEmail.id,
          fullName: checkEmail.fullName,
          email: checkEmail.email,
          token,
        },
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

exports.checkAuthIntegrate = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.userId.id,
      },
    });

    res.send({
      status: "Success",
      message: "Valid user profile",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(401).send({
      status: "ERROR",
      message: "Check authentication error",
    });
  }
};

//----------------------------------------AUTHENTICATION END-----------------------------------

//----------------------------------------USER GET & EDIT---------------------------------

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "location"],
      },
    });

    res.send({
      status: "success",
      message: "GET ALL Users Successfull",
      data: {
        users,
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

exports.oneUser = async (req, res) => {
  try {
    const { userId } = req;

    const findOne = await User.findOne({
      where: {
        id: userId.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    res.send({
      status: "success",
      message: "GET ALL Users Successfull",
      data: findOne,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "error",
      message: "Server Error",
    });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().min(10).max(30),
      fullName: Joi.string().min(3).max(40),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res.status(400).send({
        status: "Authentication Failed",
        message: error.details[0].message,
      });

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    const update = {
      ...checkEmail,
      fullName: fullName,
    };

    const user = await User.update(update, {
      where: {
        email: email,
      },
    });

    const newUser = await User.findOne({
      where: {
        email: email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "location"],
      },
    });

    res.send({
      status: "success",
      message: "User Succesfully Registered",
      data: {
        user: newUser,
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
