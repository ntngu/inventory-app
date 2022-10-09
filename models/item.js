const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  expiration_date: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true },
  type: [{ type: Schema.Types.ObjectId, ref: "Type" }],
});

ItemSchema.virtual("url").get(function() {
  return `/catalog/item/${this.id}`
})

module.exports = mongoose.model("Item", ItemSchema);