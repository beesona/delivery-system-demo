import { IData } from '../../types/delivery-types';
import { KafkaEventProducer } from './kafka-service';

export enum EventServiceTypes {
  KAFKA = 'KAFKA',
  RABBITMQ = 'RABBITMQ',
  EVENTHUB = 'EVENTHUB'
}

enum EventTopics {
  DELIVERY_CHANGE = 'delivery-change',
  ORDER_CHANGE = 'order-change',
  DELIVERY_ATTEMPT_CHANGE = 'delivery-attempt-change',
  DELIVERY_DETAILS_CHANGE = 'delivery-details-change',
  DELIVERY_STATE_CHANGE = 'delivery-state-change'
}

interface IEvent {
  topic: string;
  payload: IData;
}

interface IEventPublisher {
  publish(event: IEvent): void;
}

const eventServiceFactory = (
  eventServiceType: EventServiceTypes
): IEventPublisher => {
  switch (eventServiceType) {
    case EventServiceTypes.KAFKA:
      // the Producer depends on the following environment variables:
      // - KAFKA_CLIENT_ID
      // - KAFKA_BROKER_1
      // - KAFKA_BROKER_2
      // - KAFKA_BROKER_3
      return new KafkaEventProducer();
    case EventServiceTypes.EVENTHUB:
      throw new Error('EventHub not implemented');
    case EventServiceTypes.RABBITMQ:
      throw new Error('RabbitMQ not implemented');
    default:
      throw new Error('Invalid event service type');
  }
};

export { IEventPublisher, IEvent, EventTopics, eventServiceFactory };
