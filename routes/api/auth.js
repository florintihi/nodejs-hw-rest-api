const express = require("express");
const router = express.Router();
const ctrlUser = require("../../controller/ctrlUser");
const auth = require("../../services/authentic");
const { upload } = require("../../controller/ctrlUser");

router.post("/signup", ctrlUser.addUser);
router.post("/signin", ctrlUser.signIn);
router.get("/logout", auth, ctrlUser.logOut);
router.get("/current", auth, ctrlUser.currentUser);
router.patch("/avatars", auth, upload.single("avatar"), ctrlUser.updateAvatar);
router.get("/verify/:verificationToken", ctrlUser.verifyEmail);
router.post("/verify", ctrlUser.verify);

module.exports = router;
