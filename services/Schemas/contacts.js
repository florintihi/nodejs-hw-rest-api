const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = Schema(
  {
    name: {
      type: String,
      minlength: 3,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: false, collection: "contacts" }
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
