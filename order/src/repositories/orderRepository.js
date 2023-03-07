const Order = require('../models/order');

class OrderRepository {
  async create(order) {
    const newOrder = new Order(order);
    await newOrder.save();
    return newOrder;
  }

  async findById(id) {
    return Order.findById(id);
  }

  async findAll() {
    return Order.find();
  }

  async update(id, update) {
    return Order.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id) {
    return Order.findByIdAndDelete(id);
  }
}

module.exports = new OrderRepository();
