import { Kafka, Producer } from 'kafkajs';
import { IEventPublisher, IEvent } from './event-service';

class KafkaEventProducer implements IEventPublisher {
  kafka: Kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'change-client',
    brokers: [process.env.KAFKA_BROKER_1 || 'localhost:9092']
  });
  producer: Producer = this.kafka.producer({ allowAutoTopicCreation: true });

  constructor() {
    try {
      this.producer.connect();
    } catch (error) {
      console.error(error);
    }
  }

  async publish(event: IEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: event.topic,
        messages: [{ value: JSON.stringify(event.payload) }]
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export { KafkaEventProducer };
