const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setupOrderConsumer();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }


  async setupOrderConsumer() {
    const amqpServer = "amqp://localhost:5672";
    const connection = await amqp.connect(amqpServer);
    const channel = await connection.createChannel();
    await channel.assertQueue("orders");

    channel.consume("orders", (data) => {
      console.log("Consuming ORDER service");
      const { products, userEmail } = JSON.parse(data.content);
      console.log("products", products);
      const newOrder = new Order({
        products,
        user: userEmail,
        totalPrice: products.reduce((acc, product) => acc + product.price, 0),
      });
      newOrder.save();
      channel.ack(data);
      console.log("Order saved to DB and ACK sent to ORDER queue")

      channel.sendToQueue(
        "products",
        Buffer.from(JSON.stringify({ newOrder }))
      );
    });
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
