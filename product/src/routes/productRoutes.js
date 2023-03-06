const express = require("express");
const ProductController = require("../controllers/productController");

const router = express.Router();
const productController = new ProductController();

router.post("/", productController.createProduct);

module.exports = router;
