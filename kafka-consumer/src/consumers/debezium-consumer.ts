import { Kafka } from 'kafkajs';
import { RedisService } from '../redis-service';
import { convertData } from '../services/data-service';
import { Delivery, DeliveryAttempt, DeliveryDetails, DeliveryStateChange, Order } from '../types';
import { ElasticsearchService } from '../services/elasticsearch-service';

// This consumer listen to changes to topics created by debezium and selectively forwards them to the appropriate topic.
// It really is just cleaning out some of the debezium metadata we won't need.

const deliveryTopics = [
  'data.public.deliveries',
  'data.public.delivery_attempts',
  'data.public.delivery_details',
  'data.public.orders'
];
const brokers = [
  process.env.KAFKA_BROKER_1 || 'localhost:9092',
  process.env.KAFKA_BROKER_2 || 'localhost:9093',
  process.env.KAFKA_BROKER_3 || 'localhost:9094'
];
console.log('==============================================');
console.log(brokers);
console.log('==============================================');
const kafka = new Kafka({
  clientId: process.env.CLIENT_ID || 'delivery-change-client',
  brokers
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'delivery-group' });
const producer = kafka.producer({ allowAutoTopicCreation: true });

//const redisService = new RedisService();
//redisService.connect();
const elastic = new ElasticsearchService();

const run = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topics: deliveryTopics, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value) {
        await processMessage(topic, message.value.toString());
      }
    }
  });
};

run().catch(console.error);

const processMessage = async (topic: string, message: string) => {
  let data = undefined;
  switch (topic) {
    case 'data.public.orders':
      data = convertData(message) as Order;
      topic = 'orders';
      break;
    case 'data.public.deliveries':
      data = convertData(message) as Delivery;
      topic = 'deliveries';
      break;
    case 'data.public.delivery_details':
      data = convertData(message) as DeliveryDetails;
      topic = 'delivery_details';
      break;
    case 'data.public.delivery_attempts':
      data = convertData(message) as DeliveryAttempt;
      topic = 'delivery_attempts';
      break;
    case 'data.public.delivery_state_changes':
      data = convertData(message) as DeliveryStateChange;
      topic = 'delivery_state_changes';
      break;
    default:
      console.log('Unknown topic:', topic);
  }
  if (data) {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }]
    });
    console.log('Produced:', topic, data.id);
  }
};
