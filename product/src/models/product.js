const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
}, { collection : 'products' });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
