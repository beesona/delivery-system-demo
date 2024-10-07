import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  NonAttribute,
  HasOneGetAssociationMixin,
  Association,
  ForeignKey,
  HasOneSetAssociationMixin,
  HasManyAddAssociationMixin,
  HasOneCreateAssociationMixin,
  HasManyCreateAssociationMixin
} from 'sequelize';
import { DeliveryStatus } from '../types/delivery-types';
import { tableSettings } from '../services/database-service';
import { Order } from './order';
import { DeliveryAttempt } from './deliveryAttempt';
import { DeliveryStateChange } from './deliveryStateChange';
import { DeliveryDetails } from './deliveryDetails';

class Delivery extends Model<InferAttributes<Delivery>, InferCreationAttributes<Delivery>> {
  declare id: CreationOptional<number>;
  declare deliveryType: string;
  declare notes: CreationOptional<string>;
  declare status: DeliveryStatus;
  declare dispatchAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare mileage: number;

  // Order association mixins.
  declare orderId: ForeignKey<Order['id']>;
  declare getOrder: HasOneGetAssociationMixin<Order>;
  declare setOrder: HasOneSetAssociationMixin<Order, 'orderId'>;
  declare addDeliveryAttempt: HasManyAddAssociationMixin<DeliveryAttempt, number>;
  declare createDeliveryAttempt: HasManyCreateAssociationMixin<DeliveryAttempt>;
  declare createDeliveryDetails: HasOneCreateAssociationMixin<DeliveryDetails>;

  // Order
  declare order?: NonAttribute<Order>;
  declare static associations: {
    order: Association<Delivery, Order>;
    deliveryAttempts: Association<Delivery, DeliveryAttempt>;
    deliveryDetails: Association<Delivery, DeliveryDetails>;
  };

  static initModel = async (sequelize: Sequelize) => {
    Delivery.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true
        },
        deliveryType: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        notes: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        status: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        dispatchAt: {
          type: new DataTypes.DATE(),
          allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        mileage: {
          type: new DataTypes.INTEGER(),
          allowNull: true
        }
      },
      {
        ...tableSettings,
        modelName: 'Delivery',
        sequelize
      }
    );
  };
}

export { Delivery };
