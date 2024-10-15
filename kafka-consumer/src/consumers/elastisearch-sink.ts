import { Kafka } from 'kafkajs';
import { ElasticsearchService } from '../services/elasticsearch-service';

interface FullDelivery {
  DELIVERY_ID: number;
  DELIVERY_TYPE: string;
  NOTES: string;
  STATUS: string;
  DISPATCH_AT: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  MILEAGE: number;
  ORDER_ID: number;
  ORGANIZATION_ID: number;
  FROM_INSTRUCTIONS: string;
  FROM_CONTACT_NAME: string;
  TO_INSTRUCTIONS: string;
  TO_CONTACT_NAME: string;
  FROM_ADDRESS: string;
  FROM_CITY: string;
  FROM_STATE: string;
  FROM_ZIP: string;
  FROM_COUNTRY: string;
  FROM_PHONE_NUMBER: string;
  TO_ADDRESS: string;
  TO_CITY: string;
  TO_STATE: string;
  TO_ZIP: string;
  TO_COUNTRY: string;
  TO_PHONE_NUMBER: string;
}

const deliveryTopics = ['FULLDELIVERY'];

const brokers = [
  process.env.KAFKA_BROKER_1 || 'localhost:9092',
  process.env.KAFKA_BROKER_2 || 'localhost:9093',
  process.env.KAFKA_BROKER_3 || 'localhost:9094'
];
const kafka = new Kafka({
  clientId: process.env.CLIENT_ID || 'delivery-sink-client',
  brokers
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'delivery-sink-group' });
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
  let data = JSON.parse(message) as FullDelivery;
  if (data.DELIVERY_ID) {
    try {
      console.log('Indexing:', topic, data.DELIVERY_ID);
      await elastic.updateDocument('fulldelivery', data.DELIVERY_ID.toString(), {
        doc: data,
        doc_as_upsert: true
      });
    } catch (ex) {
      console.log(ex);
    }
  }
};
