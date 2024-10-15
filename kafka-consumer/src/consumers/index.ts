import { Kafka } from 'kafkajs';
import { RedisService } from '../redis-service';
import { convertData } from '../services/data-service';
import { Delivery, DeliveryAttempt, DeliveryDetails, DeliveryStateChange, Order } from '../types';
import { ElasticsearchService } from '../services/elasticsearch-service';

const deliveryTopics = ['FULLDELIVERY'];

const brokers = [
  process.env.KAFKA_BROKER_1 || 'localhost:9092',
  process.env.KAFKA_BROKER_2 || 'localhost:9093',
  process.env.KAFKA_BROKER_3 || 'localhost:9094'
];
const kafka = new Kafka({
  clientId: process.env.CLIENT_ID || 'delivery-change-client',
  brokers
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'delivery-group' });

//const redisService = new RedisService();
//redisService.connect();
const elastic = new ElasticsearchService();

const run = async () => {
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
      break;
    case 'data.public.deliveries':
      data = convertData(message) as Delivery;
      break;
    case 'data.public.delivery_details':
      data = convertData(message) as DeliveryDetails;
      break;
    case 'data.public.delivery_attempts':
      data = convertData(message) as DeliveryAttempt;
      break;
    case 'data.public.delivery_state_changes':
      data = convertData(message) as DeliveryStateChange;
      break;
    default:
      console.log('Unknown topic:', topic);
  }
  if (data && data.op === 'c') {
    try {
      console.log('Indexing:', topic, data.id);
      await elastic.indexDocument(topic, data.id.toString(), data);
    } catch (ex) {
      console.log(ex);
    }
  } else if (data && data.op === 'u') {
    try {
      console.log('Updating:', topic, data.id);
      await elastic.updateDocument(topic, data.id.toString(), {
        doc: data
      });
    } catch (ex) {
      console.log(ex);
    }
  }
};
