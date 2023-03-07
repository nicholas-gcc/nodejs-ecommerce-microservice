// const Order = require("../models/order");

// class OrderService {
//   async createOrder(orderData) {
//     const order = new Order(orderData);

//     try {
//       await order.save();
//       return order;
//     } catch (error) {
//       console.error(error);
//       throw new Error("Could not create order");
//     }
//   }

//   async getAllOrders() {
//     try {
//       const orders = await Order.find();
//       return orders;
//     } catch (error) {
//       console.error(error);
//       throw new Error("Could not get orders");
//     }
//   }

//   async getOrderById(id) {
//     try {
//       const order = await Order.findById(id);
//       if (!order) {
//         throw new Error(`Order with id ${id} not found`);
//       }
//       return order;
//     } catch (error) {
//       console.error(error);
//       throw new Error(`Could not get order with id ${id}`);
//     }
//   }
// }

// module.exports = OrderService;
