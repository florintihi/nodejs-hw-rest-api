const gravatar = require("gravatar");
const User = require("../services/Schemas/users");
const service = require("../services/userService");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises;

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
    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "retro" });
    const newUser = await service.createUser({
      email,
      password,
      subscription,
      token,
      avatarURL,
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
        avatarURL,
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

const avatarsDir = path.join(__dirname, "../public/avatars");
const tempDir = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});
const upload = multer({
  storage,
});

const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    await fs.rename(tempUpload, resultUpload);

    const avatarURL = path.join("avatar", filename);
    await Jimp.read(resultUpload).then((file) => {
      return file.resize(250, 250).write(resultUpload);
    });

    await User.findOneAndUpdate(_id, { avatarURL });
    res.json({
      status: "Success",
      code: 200,
      data: {
        avatarURL,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUser,
  signIn,
  logOut,
  currentUser,
  updateAvatar,
  upload,
};
