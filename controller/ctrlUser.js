// const express = require("express");
// const router = express.Router();
const User = require("../services/Schemas/users");
const service = require("../services/userService");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const addUser = async (req, res, next) => {
  const { email, password, subscription, token } = req.body;
  const user = await service.getUser(email);
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const newUser = await service.createUser({
      email,
      password,
      subscription,
      token,
    });
    // const newUser = new User({ email, subscription, token });
    await newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await service.getUser(email);
  if (!user || !(await user.isValidPassword(password))) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
      data: {
        message: "Email or password is wrong",
      },
    });
  }

  try {
    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
    await service.updateToken(payload.id, { token });
  } catch (error) {
    next(error);
  }
};

const logOut = async (req, res, next) => {
  const { _id } = req.user;
  try {
    await User.findOneAndUpdate({ _id: _id }, { token: null });
    res.json({
      status: "success",
      code: 204,
      data: { message: "Logout success" },
    });
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    res.json({
      status: "Success",
      code: 200,
      data: {
        email: req.user.email,
        subscription: req.user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addUser,
  signIn,
  logOut,
  currentUser,
};
