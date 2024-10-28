import { Kafka } from 'kafkajs';
import { ElasticsearchService } from '../services/elasticsearch-service';
import { FullDelivery, DeliveryAttempt } from '../types';

// This consumer listens to the FUlLDELIVERY topic and indexes the data in Elasticsearch.
// FULLDELIVERY is derived from a kafka table called fullDelivery, and it combines data from multiple tables.
const deliveryTopics = ['FULLDELIVERY', 'delivery_attempts'];

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
  switch (topic) {
    case 'FULLDELIVERY':
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
    case 'delivery_attempts':
      // serialize the attempt and try to add it to the delivery.
      let attemptData = JSON.parse(message) as DeliveryAttempt;
      await elastic.updateDocument('fulldelivery', attemptData.delivery_id.toString(), {
        doc: { LATEST_DELIVERY_ATTEMPT: attemptData }
      });
      break;
    default:
      console.log('Unknown topic:', topic);
  }
};
