import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
  ForeignKey,
  NonAttribute,
  Association
} from 'sequelize';
import { tableSettings } from '../services/database-service';
import { Delivery } from './delivery';

export class DeliveryDetails extends Model<
  InferAttributes<DeliveryDetails, { omit: 'delivery' }>,
  InferCreationAttributes<DeliveryDetails, { omit: 'delivery' }>
> {
  declare fromInstructions: CreationOptional<string>;
  declare fromContactName: CreationOptional<string>;
  declare fromAddress: string;
  declare fromCity: string;
  declare fromState: string;
  declare fromZip: string;
  declare fromCountry: string;
  declare fromPhoneNumber: string;
  declare toInstructions: CreationOptional<string>;
  declare toContactName: CreationOptional<string>;
  declare toAddress: string;
  declare toCity: string;
  declare toState: string;
  declare toZip: string;
  declare toCountry: string;
  declare toPhoneNumber: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare delivery_id?: ForeignKey<Delivery['id']>;
  declare delivery?: NonAttribute<Delivery>;

  declare static associations: {
    delivery: Association<DeliveryDetails, Delivery>;
  };

  static initModel = async (sequelize: Sequelize) => {
    DeliveryDetails.init(
      {
        fromInstructions: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        fromContactName: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        toInstructions: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        toContactName: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        fromAddress: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        fromCity: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        fromState: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        fromZip: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        fromCountry: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        fromPhoneNumber: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toAddress: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toCity: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toState: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toZip: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toCountry: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        toPhoneNumber: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'DeliveryDetails',
        sequelize
      }
    );
  };
}
