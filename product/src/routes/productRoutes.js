const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../../../utils/isAuthenticated");

const router = express.Router();
const productController = new ProductController();

router.post("/", isAuthenticated, productController.createProduct);

module.exports = router;
