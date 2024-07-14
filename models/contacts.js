const { readData } = require("./dataServices");
const { writeData } = require("./dataServices");

const listContacts = async () => {
  const contacts = await readData();
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await readData();
  const contact = contacts.find((contact) => contact.id === contactId);
  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await readData();
  const newContacts = contacts.filter((contact) => contact.id !== contactId);
  await writeData(newContacts);
};

const addContact = async (body) => {
  const contacts = await readData();
  const newContact = {
    id: Date.now(),
    name: body.name,
    email: body.email,
    phone: body.phone,
  };
  contacts.push(newContact);
  await writeData(contacts);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await readData();
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );

  if (contactIndex === -1) {
    return null;
  }
  contacts[contactIndex] = { id: contactId, ...body };

  await writeData(contacts);
  return contacts[contactIndex];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
