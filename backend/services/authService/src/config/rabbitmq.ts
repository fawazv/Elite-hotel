import amqplib, { Connection, Channel } from "amqplib";

let connection: Connection;
let channel: Channel;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "";

export const rabbitmqConnect = async () => {
  while (true) {
    try {
      connection = await amqplib.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      console.log("Connected to RabbitMQ in authService");
      break;
    } catch (error) {
      console.error("Failed to connect to RabbitMQ", error);
      console.log("retrying connection in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export const getChannel = (): Channel => channel;
