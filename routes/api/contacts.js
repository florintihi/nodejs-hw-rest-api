const express = require("express");
const router = express.Router();
const ctrlContact = require("../../controller");

router.get("/contacts", ctrlContact.getAll);

router.get("/contacts/:contactId", ctrlContact.getById);

router.post("/contacts", ctrlContact.add);

router.delete("/contacts/:contactId", ctrlContact.remove);

router.patch("/contacts/:contactId/favorite", ctrlContact.updateStatus);

router.put("/contacts/:contactId", ctrlContact.update);

module.exports = router;
