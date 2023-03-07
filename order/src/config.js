require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    rabbitMQURI: 'amqp://localhost',
    rabbitMQQueue: 'orders',
    port: 3002
};
  