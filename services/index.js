const contact = require("./Schemas/contacts.js");

const getAllcontacts = async () => {
  return contact.find();
};

const getContactById = (id) => {
  return contact.findOne({ _id: id });
};

const addContact = (body) => {
  return contact.create(body);
};

const updateContact = (id, fields) => {
  return contact.findByIdAndUpdate({ _id: id }, fields, { new: true });
};

const removeContact = (id) => {
  return contact.findByIdAndDelete({ _id: id });
};

module.exports = {
  getAllcontacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
};
