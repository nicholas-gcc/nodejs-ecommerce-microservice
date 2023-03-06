module.exports = {
    port: process.env.PORT || 3001,
    mongoURI: process.env.MONGODB_URI || "mongodb://localhost/products",
    rabbitMQURI: process.env.RABBITMQ_URI || "amqp://localhost",
    exchangeName: "products",
    queueName: "products_queue",
  };
  