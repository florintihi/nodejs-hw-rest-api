const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts");
const Joi = require("joi");

const router = express.Router();

const itemsSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.number().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.contactId, 10);
    const contactById = await getContactById(contactId);
    if (!contactById) {
      res.status(404).json({ message: "Contact Not Found" });
    } else {
      res.status(200).json(contactById);
      console.log(contactById);
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = itemsSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
    }
    if (!name || !email || !phone) {
      res.status(400).json({ message: "missing required name field" });
    } else {
      const newContact = await addContact({ name, email, phone });
      res.status(201).json(newContact);
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.contactId) || req.params.contactId;

    const contact = await getContactById(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ message: `Contact with ID ${contactId} was not found` });
    }

    await removeContact(contactId);
    res
      .status(200)
      .json({ message: `Contact with ID ${contactId} was deleted` });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.contactId) || req.params.contactId;
    const { error } = itemsSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const updatedContact = await updateContact(contactId, req.body);

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error3" });
  }
});

module.exports = router;
