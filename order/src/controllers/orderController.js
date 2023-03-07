const Order = require("../models/order");
const messageBroker = require("../utils/messageBroker");

class OrderController {
  async createOrder(req, res) {
    try {
      const { productIds } = req.body;
      const products = await messageBroker.consumeMessage("products");
      const selectedProducts = products.filter(
        (product) => productIds.includes(product._id.toString())
      );
      const totalPrice = selectedProducts.reduce(
        (acc, curr) => acc + curr.price,
        0
      );
      const order = new Order({
        products: selectedProducts,
        totalPrice,
        createdAt: Date.now(),
        user: req.user.email,
      });
      await order.save();
      await messageBroker.publishMessage("orders", order);
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = OrderController;
