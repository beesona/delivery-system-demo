import { DeliveryAttempt, DeliveryDetails, DeliveryStateChange, Order } from '../models';
import { Delivery } from '../models/delivery';
import {
  DeliveryAttemptData,
  DeliveryData,
  DeliveryStateChangeData,
  DeliveryStatus,
  OrderData
} from '../types/delivery-types';
import { ModelService } from './model-service';

export class DeliveryService extends ModelService {
  constructor() {
    super();
  }

  async createDelivery(
    deliveryData?: DeliveryData,
    orderId?: number
  ): Promise<DeliveryData | undefined> {
    let response = undefined;
    const delivery = await Delivery.build({
      deliveryType: deliveryData?.deliveryType || 'BUSINESS',
      notes: deliveryData?.notes || 'N/A',
      status: deliveryData?.status || DeliveryStatus.draft,
      dispatchAt: deliveryData?.dispatchAt || new Date(),
      mileage: deliveryData?.mileage || 10
    });
    try {
      // if we didnt get an order id, create an order.
      let order;
      if (!orderId) {
        order = await Order.create(deliveryData?.order);
      } else {
        // add delivery to existing order.
        order = await Order.findByPk(orderId);
      }
      await delivery.save();
      if (order) await order.addDelivery(delivery);
      if (delivery) {
        // create deliveryDetails.
        const deliveryDetails = await delivery.createDeliveryDetails(deliveryData?.deliveryDetails);

        //create attempt.
        let attempt;
        if (deliveryData?.deliveryAttempts) {
          attempt = await delivery.createDeliveryAttempt(deliveryData.deliveryAttempts[0]);
        } else {
          attempt = await delivery.createDeliveryAttempt({ status: delivery.status });
        }

        //create initial state change.
        const stateChange = await attempt.createStateChange({ state: delivery.status });
        //const stateChange = await DeliveryStateChange.create({ state: delivery.status });
        let attemptData: DeliveryAttemptData | undefined = undefined;
        if (attempt) {
          attemptData = { ...(attempt.toJSON() as DeliveryAttemptData) };
          if (stateChange) {
            attemptData.deliveryStateChanges = [stateChange.toJSON()];
          }
        }
        response = {
          ...delivery.toJSON(),
          order: order?.toJSON(),
          deliveryAttempts: [attemptData],
          deliveryDetails: deliveryDetails?.toJSON()
        } as DeliveryData;
        delete response.orderId;
      }
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async GetDelivery(deliveryId: number): Promise<DeliveryData | undefined> {
    let response = undefined;
    try {
      const delivery = await Delivery.findByPk(deliveryId, {
        include: [
          {
            association: Delivery.associations.deliveryAttempts,
            include: [
              {
                association: DeliveryAttempt.associations.stateChanges,
                attributes: { exclude: ['deliveryAttemptId'] }
              }
            ],
            attributes: { exclude: ['DeliveryId'] }
          },
          {
            association: Delivery.associations.deliveryDetails,
            attributes: { exclude: ['deliveryId'] }
          }
        ],
        attributes: { exclude: ['orderId'] }
      });
      if (delivery) {
        const order = await Order.findByPk(delivery.orderId);
        response = { ...delivery.toJSON(), order: order?.toJSON() } as DeliveryData;
      }
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async createNewDeliveryAttempt(
    deliveryId: number,
    status: DeliveryStatus
  ): Promise<DeliveryAttemptData | undefined> {
    let response: any;
    try {
      const delivery = await Delivery.findByPk(deliveryId);
      if (delivery) {
        const newAttempt = await delivery.createDeliveryAttempt({
          status
        });
        response = newAttempt.toJSON();
      }
    } catch (error) {
      console.error(error);
    }
    return response;
  }

  async createNewDeliveryStateChange(
    deliveryId: number,
    status: DeliveryStatus
  ): Promise<DeliveryStateChangeData | undefined> {
    let response: DeliveryStateChangeData | undefined = undefined;
    try {
      const delivery = await Delivery.findByPk(deliveryId);
      if (delivery) {
        // create the state change
        const stateChange = await DeliveryStateChange.create({ state: status });
        // update the latest delivery attempt.
        const deliveryAttempt = await DeliveryAttempt.findOne({
          where: { delivery_id: delivery.id },
          order: [['updated_at', 'DESC']]
        });
        if (deliveryAttempt) {
          await deliveryAttempt.update({ status });
          await deliveryAttempt.addStateChange(stateChange);
        }
        // update the delivery status.
        await delivery.update({ status });
        response = stateChange.toJSON();
      }
    } catch (error) {
      console.error(error);
    }
    return response;
  }
}
