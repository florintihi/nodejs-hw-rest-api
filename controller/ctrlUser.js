const gravatar = require("gravatar");
const User = require("../services/Schemas/users");
const service = require("../services/userService");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises;
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const contactSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
});

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
    const verificationToken = uuidv4();
    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "retro" });
    const newUser = await service.createUser({
      email,
      password,
      subscription,
      token,
      avatarURL,
      verificationToken,
    });

    await newUser.setPassword(password);
    await newUser.save();

    const message = {
      to: email,
      from: "yveshw06@outlook.com",
      subject: "Verify your email",
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">Click to verify your email!</a>`,
    };

    await sgMail.send(message);
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

  if (!user.verify) {
    return res.json({
      status: "error",
      code: 401,
      message: "Email not verified!",
    });
  }

  try {
    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
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

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      res.json({
        status: "Error",
        code: 404,
        message: "User not found!",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });
    res.json({
      status: "Success",
      code: 200,
      message: "Verification successful!",
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await service.getUser(email);
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "missing required field email" });
      return;
    }
    const message = {
      to: email,
      from: "yveshw06@outlook.com",
      subject: "Verify your email",
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${user.verificationToken}">Click to verify your email!</a>`,
    };

    if (!user.verify) {
      await sgMail.send(message);
      return res.json({
        status: "success",
        code: 200,
        message: "Verification email sent",
      });
    }

    return res.json({
      status: "error",
      code: 400,
      message: "Verification has already been passed",
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
  updateAvatar,
  upload,
  verifyEmail,
  verify,
};
