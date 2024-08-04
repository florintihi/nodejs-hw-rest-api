const express = require("express");
const router = express.Router();
const ctrlUser = require("../../controller/ctrlUser");
const auth = require("../../services/authentic");

router.post("/signup", ctrlUser.addUser);
router.post("/signin", ctrlUser.signIn);
router.get("/logout", auth, ctrlUser.logOut);
router.get("/current", auth, ctrlUser.currentUser);

module.exports = router;
