import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  Association,
  NonAttribute,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManySetAssociationsMixin
} from 'sequelize';
import { tableSettings } from '../services/database-service';
import { Delivery } from './delivery';
import { HasManyRemoveAssociationsMixin } from 'sequelize';

export class Order extends Model<
  InferAttributes<Order, { omit: 'deliveries' }>,
  InferCreationAttributes<Order, { omit: 'deliveries' }>
> {
  declare id: CreationOptional<number>;
  declare organizationId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Order association mixins.
  declare getDeliveries: HasManyGetAssociationsMixin<Delivery>;
  declare addDelivery: HasManyAddAssociationMixin<Delivery, number>;
  declare addDeliveries: HasManyAddAssociationsMixin<Delivery, number>;
  declare setDeliveries: HasManySetAssociationsMixin<Delivery, number>;
  declare removeDelivery: HasManyRemoveAssociationMixin<Delivery, number>;
  declare removeDeliveries: HasManyRemoveAssociationsMixin<Delivery, number>;
  declare hasDelivery: HasManyHasAssociationMixin<Delivery, number>;
  declare hasDeliveries: HasManyHasAssociationsMixin<Delivery, number>;
  declare countDeliveries: HasManyCountAssociationsMixin;
  declare createDelivery: HasManyCreateAssociationMixin<Delivery, 'orderId'>;

  // Deliveries
  declare deliveries?: NonAttribute<Delivery[]>;
  declare static associations: { deliveries: Association<Order, Delivery> };

  static initModel = async (sequelize: Sequelize) => {
    Order.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true
        },
        organizationId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'Order',
        sequelize
      }
    );
  };
}
