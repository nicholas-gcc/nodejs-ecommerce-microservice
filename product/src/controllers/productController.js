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
  
      const orderId = uuid.v4(); // Generate a unique order ID
      this.ordersMap.set(orderId, { 
        status: "pending", 
        products, 
        username: req.user.username
      });
  
      await messageBroker.publishMessage("orders", {
        products,
        username: req.user.username,
        orderId, // include the order ID in the message to orders queue
      });

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
  
      // Long polling until order is completed
      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking status again
        order = this.ordersMap.get(orderId);
      }
  
      // Once the order is marked as completed, return the complete order details
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  

  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
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
