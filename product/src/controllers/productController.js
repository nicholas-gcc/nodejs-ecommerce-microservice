const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");

class ProductController {
    async createProduct(req, res, next) {
        try {
          const token = req.headers.authorization
          if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
          const product = new Product(req.body);
      
          const validationError = product.validateSync();
          if (validationError) {
            return res.status(400).json({ message: validationError.message });
          }
      
        console.log("product", product)
          await product.save({ timeout: 30000 });
        console.log("product saved", product)
      
          await messageBroker.publishMessage("products", product);
      
          res.status(201).json(product);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
      
}

module.exports = ProductController;

