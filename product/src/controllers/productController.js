const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

/**
 * Class to hold the API implementation for the product services
 */
class ProductController {

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);

    this.ordersMap = new Map();

    // Setup consumer for "products" queue
    messageBroker.consumeMessage("products", (data) => {
      const orderData = JSON.parse(JSON.stringify(data));
      const { orderId } = orderData;
      const order = this.ordersMap.get(orderId);
      if (order) {
        // update the order in the map
        this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
        console.log("Updated order:", order);
      }
    });
  }


  async createProduct(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { ids } = req.body;
      const products = await Product.find({ _id: { $in: ids } });

      // Calculate an initial totalPrice
      const totalPrice = products.reduce((acc, product) => acc + product.price, 0);

      const orderId = uuid.v4(); // Generate a unique order ID
      this.ordersMap.set(orderId, { 
        status: 'pending', 
        products, 
        userEmail: req.user.email, 
        totalPrice  // Save the partially created order with totalPrice in the map
      });

      await messageBroker.publishMessage("orders", {
        products,
        userEmail: req.user.email,
        orderId, // include the order ID in the message to orders queue
      });

      return res.status(201).json({ orderId, products, totalPrice }); // Return the order ID, products, and totalPrice in the response
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }


  async getOrderStatus(req, res, next) { // New method to check order status
    try {
      const { orderId } = req.params;
      const order = this.ordersMap.get(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getProducts(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const products = await Product.find({});

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
