const express = require("express");
const router = express.Router();
const ctrlContact = require("../../controller/ctrlContact");
// const passport = require("passport");
const auth = require("../../services/authentic");

router.get("/", auth, ctrlContact.getAll);

router.get("/:contactId", auth, ctrlContact.getById);

router.post("/", auth, ctrlContact.add);

router.delete("/:contactId", auth, ctrlContact.remove);

router.patch("/:contactId/favorite", auth, ctrlContact.updateStatus);

router.put("/:contactId", auth, ctrlContact.update);

module.exports = router;
