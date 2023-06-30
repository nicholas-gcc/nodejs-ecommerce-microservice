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
    console.log("Connecting to RabbitMQ...");
  
    setTimeout(async () => {
      try {
        const amqpServer = "amqp://rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("Connected to RabbitMQ");
        const channel = await connection.createChannel();
        await channel.assertQueue("orders");
  
        channel.consume("orders", async (data) => {
          // Consume messages from the order queue on buy
          console.log("Consuming ORDER service");
          const { products, username, orderId } = JSON.parse(data.content);
  
          const newOrder = new Order({
            products,
            user: username,
            totalPrice: products.reduce((acc, product) => acc + product.price, 0),
          });
  
          // Save order to DB
          await newOrder.save();
  
          // Send ACK to ORDER service
          channel.ack(data);
          console.log("Order saved to DB and ACK sent to ORDER queue");
  
          // Send fulfilled order to PRODUCTS service
          // Include orderId in the message
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
          );
        });
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000); // add a delay to wait for RabbitMQ to start in docker-compose
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
