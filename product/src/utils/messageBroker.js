const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    try {
      const connection = await amqp.connect("amqp://localhost");
      this.channel = await connection.createChannel();
      await this.channel.assertQueue("products");
      console.log("RabbitMQ connected");
    } catch (err) {
      console.log(err);
    }
  }

  async publishMessage(queue, message) {
    try {
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (err) {
      console.log(err);
    }
  }

  async consumeMessage(queue, callback) {
    try {
      await this.channel.consume(queue, (message) => {
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
