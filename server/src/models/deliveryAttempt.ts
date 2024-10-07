import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
  ForeignKey,
  Association,
  HasOneGetAssociationMixin,
  NonAttribute,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin
} from 'sequelize';
import { DeliveryStatus } from '../types/delivery-types';
import { tableSettings } from '../services/database-service';
import { Delivery } from './delivery';
import { DeliveryStateChange } from './deliveryStateChange';

export class DeliveryAttempt extends Model<
  InferAttributes<DeliveryAttempt>,
  InferCreationAttributes<DeliveryAttempt>
> {
  declare id: CreationOptional<number>;
  declare delivery_id?: ForeignKey<Delivery['id']>;
  declare delivery?: NonAttribute<Delivery>;
  declare status: DeliveryStatus;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
  declare static associations: {
    stateChanges: Association<DeliveryAttempt, DeliveryStateChange>;
  };

  declare getDelivery: HasOneGetAssociationMixin<Delivery>;
  declare addStateChange: HasManyAddAssociationMixin<DeliveryStateChange, number>;
  declare createStateChange: HasManyCreateAssociationMixin<DeliveryStateChange>;

  static initModel = async (sequelize: Sequelize) => {
    DeliveryAttempt.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true
        },
        status: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'DeliveryAttempt',
        sequelize
      }
    );
  };
}
