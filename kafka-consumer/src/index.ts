import { Kafka } from 'kafkajs';
import { RedisService } from './redis-service';

const deliveryTopics = [
  'data.public.deliveries',
  'data.public.delivery_attempts',
  'data.public.delivery_details',
  'data.public.delivery_details',
  'data.public.orders'
];

const brokers = [
  process.env.KAFKA_BROKER_1 || '',
  process.env.KAFKA_BROKER_2 || '',
  process.env.KAFKA_BROKER_3 || ''
];
console.log(brokers);
const kafka = new Kafka({
  clientId: process.env.CLIENT_ID || 'delivery-change-client',
  brokers
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'delivery-group' });

const redisService = new RedisService();
redisService.connect();

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: deliveryTopics, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let jsonMessage: any;
      if (message.value) {
        jsonMessage = JSON.parse(message.value.toString()).payload;
        // workaround for a bad FK name in the data.public.delivery_attempts topic
        let deliveryId;
        switch (topic) {
          case 'data.public.orders':
            redisService.set(
              `order_${jsonMessage?.after?.id.toString()}`,
              topic,
              JSON.stringify(jsonMessage)
            );
            console.log(`Saved ${topic} message for order ${jsonMessage?.after?.id}`);
            break;
          case 'data.public.delivery_attempts':
            deliveryId = jsonMessage.after.delivery_id;
            let existingAttempts;
            try {
              existingAttempts = await redisService.getHashField(deliveryId.toString(), topic);
              if (existingAttempts) {
                existingAttempts = JSON.parse(existingAttempts);
                // if this is a create operation, and we already have the attemtp, ignore it.
                if (
                  jsonMessage.op === 'c' &&
                  existingAttempts.find((a: any) => a.after.id === jsonMessage.after.id)
                ) {
                  deliveryId = -1;
                  break;
                } else if (jsonMessage.op === 'u') {
                  existingAttempts = existingAttempts.filter(
                    (a: any) => a.after.id !== jsonMessage.after.id
                  );
                }
              }
              existingAttempts = [...(existingAttempts || []), jsonMessage];
              jsonMessage = existingAttempts;
            } catch (error) {
              console.error(error);
            }
            break;
          case 'data.public.delivery_details':
            deliveryId = jsonMessage.after.delivery_id;
            break;
          case 'data.public.deliveries':
            deliveryId = jsonMessage.after.id;
            break;
          default:
            deliveryId = -1;
        }
        if (deliveryId > -1) {
          try {
            redisService.set(deliveryId.toString(), topic, JSON.stringify(jsonMessage));
            console.log(`Saved ${topic} message for delivery ${deliveryId}`);
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  });
};

run().catch(console.error);
