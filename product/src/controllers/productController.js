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
      
          await product.save({ timeout: 30000 });
            
          res.status(201).json(product);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
    

      async createOrder(req, res, next) {
        try {
        const token = req.headers.authorization
          if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
          const { ids } = req.body;
          const products = await Product.find({ _id: { $in: ids } });
      
          await messageBroker.publishMessage("orders", {
            products,
            userEmail: req.user.email
          });
      
          let order;
          
          try {
            order = await new Promise((resolve, reject) => {
              messageBroker.consumeMessage("products", (data) => {
                const order = JSON.parse(JSON.stringify(data));
                console.log("Created order:", order);
                resolve(order);
              })
              .catch((err) => {
                console.error(err);
                reject(err);
              });
            });
          } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
          }

          return res.status(201).json(order);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
}

module.exports = ProductController;

