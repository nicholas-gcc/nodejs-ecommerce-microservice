const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");

class ProductController {
    async createProduct(req, res) {
        try {
          const product = new Product(req.body);
      
          const validationError = product.validateSync();
          if (validationError) {
            return res.status(400).json({ message: validationError.message });
          }
      
          await product.save();
      
          await messageBroker.publishMessage("products", product);
      
          res.status(201).json(product);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
      
}

module.exports = ProductController;

