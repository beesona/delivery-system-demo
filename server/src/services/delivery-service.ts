import { DeliveryAttempt, DeliveryDetails, DeliveryStateChange, Order } from '../models';
import { Delivery } from '../models/delivery';
import { DbDelivery, DbDeliveryDetails, DbOrder } from '../types/db-types';
import {
  DeliveryAttemptData,
  DeliveryData,
  DeliveryStateChangeData,
  DeliveryStatus,
  OrderData
} from '../types/delivery-types';
import { ElasticsearchService, SearchFilters } from './elasticsearch-service';
import { ModelService } from './model-service';

export class DeliveryService extends ModelService {
  elastic: ElasticsearchService;
  constructor() {
    super();
    this.elastic = new ElasticsearchService();
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
    let response: DeliveryData | undefined = undefined;
    // check elasticSearch first.
    try {
      const elasticDelivery = await this.elastic.getDocument<DbDelivery>(
        'data.public.deliveries',
        deliveryId.toString()
      );
      if (elasticDelivery) {
        // get the order.
        const order = await this.elastic.getDocument<DbOrder>(
          'data.public.orders',
          elasticDelivery.order_id.toString()
        );
        // get the delivery details
        const deliveryDetails = await this.elastic.getDocument<DbDeliveryDetails>(
          'data.public.delivery_details',
          deliveryId.toString()
        );
        response = {
          id: elasticDelivery.id,
          orderId: elasticDelivery.order_id,
          deliveryType: elasticDelivery.delivery_type,
          notes: elasticDelivery.notes,
          status: elasticDelivery.status,
          dispatchAt: elasticDelivery.dispatch_at,
          mileage: elasticDelivery.mileage,
          order: {
            id: order.id,
            organizationId: order.organization_id,
            createdAt: order.created_at,
            updatedAt: order.updated_at
          },
          deliveryDetails: {
            id: deliveryDetails.id,
            deliveryId: deliveryDetails.delivery_id,
            fromInstructions: deliveryDetails.from_instructions,
            fromContactName: deliveryDetails.from_contact_name,
            fromPhoneNumber: deliveryDetails.from_phone_number,
            fromAddress: deliveryDetails.from_address,
            fromCity: deliveryDetails.from_city,
            fromState: deliveryDetails.from_state,
            fromZip: deliveryDetails.from_zip,
            fromCountry: deliveryDetails.from_country,
            toInstructions: deliveryDetails.to_instructions,
            toContactName: deliveryDetails.to_contact_name,
            toPhoneNumber: deliveryDetails.to_phone_number,
            toAddress: deliveryDetails.to_address,
            toCity: deliveryDetails.to_city,
            toState: deliveryDetails.to_state,
            toZip: deliveryDetails.to_zip,
            toCountry: deliveryDetails.to_country
          },
          createdAt: elasticDelivery.created_at,
          updatedAt: elasticDelivery.updated_at
        };
        console.log('elastic delivery', elasticDelivery);
      }
    } catch (error) {
      console.error(error);
    }
    // return the elasticSearch result if we have one.
    if (response) return response;
    // otherwise, check the database.
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

  async searchDeliveries(
    query?: SearchFilters<DbDelivery, keyof DbDelivery>
  ): Promise<DeliveryData[] | undefined> {
    let response: DeliveryData[] | undefined = undefined;
    try {
      const filters: SearchFilters<DbDelivery, keyof DbDelivery> = {
        createdAt: { gte: '2024-10-09T09:32:16.528', lte: 'now' },
        updatedAt: { gte: '2024-10-09T09:32:16.528', lte: 'now' },
        dispatchAt: { gte: '2024-10-09T09:32:16.528', lte: 'now' },
        status: [DeliveryStatus.draft],
        orderId: [110157],
        notes: { value: 'suspendo', operator: 'and' },
        sortBy: 'created_at',
        limit: 10,
        offset: 0
      };
      let searchResults = await this.elastic.search<DbDelivery, keyof DbDelivery>(
        'data.public.deliveries',
        {}
      );
      if (searchResults) {
        response = searchResults.map((result) => {
          return {
            id: result.id,
            orderId: result.order_id,
            deliveryType: result.delivery_type,
            notes: result.notes,
            status: result.status,
            dispatchAt: result.dispatch_at,
            mileage: result.mileage,
            createdAt: result.created_at,
            updatedAt: result.updated_at
          };
        });
      }
    } catch (error) {
      console.error(error);
    }
    return response;
  }
}
