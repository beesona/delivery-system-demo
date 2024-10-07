import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
  ForeignKey
} from 'sequelize';
import { DeliveryStatus } from '../types/delivery-types';
import { tableSettings } from '../services/database-service';
import { DeliveryAttempt } from './deliveryAttempt';

export class DeliveryStateChange extends Model<
  InferAttributes<DeliveryStateChange>,
  InferCreationAttributes<DeliveryStateChange>
> {
  declare deliveryAttemptId: ForeignKey<DeliveryAttempt['id']>;
  declare state: DeliveryStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel = async (sequelize: Sequelize) => {
    DeliveryStateChange.init(
      {
        state: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'DeliveryStateChange',
        sequelize
      }
    );
  };
}
