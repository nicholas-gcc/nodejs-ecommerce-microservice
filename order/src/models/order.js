const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection : 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
