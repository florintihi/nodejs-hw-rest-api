const user = require("../services/Schemas/users");

const createUser = (body) => {
  return user.create(body);
};

const getUser = (email) => {
  return user.findOne({ email: email });
};

const updateToken = (id, fields) => {
  return user.findByIdAndUpdate({ _id: id }, fields, { new: true });
};

// const updateAvatar = (id, fields) => {
//   return user.findByIdAndUpdate({ _id: id }, fields, { new: true });
// };

module.exports = {
  createUser,
  getUser,
  updateToken,
  // updateAvatar,
};
