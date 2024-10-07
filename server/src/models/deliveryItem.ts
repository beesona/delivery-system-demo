import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes
} from 'sequelize';
import { tableSettings } from '../services/database-service';

export class DeliveryItem extends Model<
  InferAttributes<DeliveryItem>,
  InferCreationAttributes<DeliveryItem>
> {
  declare description: string;
  declare lengthIn: number;
  declare widthIn: number;
  declare heightIn: number;
  declare weightLbs: number;
  declare quantity: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel = async (sequelize: Sequelize) => {
    DeliveryItem.init(
      {
        description: {
          type: new DataTypes.STRING(128),
          allowNull: false
        },
        lengthIn: {
          type: new DataTypes.INTEGER(),
          allowNull: false
        },
        widthIn: {
          type: new DataTypes.INTEGER(),
          allowNull: false
        },
        heightIn: {
          type: new DataTypes.INTEGER(),
          allowNull: false
        },
        weightLbs: {
          type: new DataTypes.INTEGER(),
          allowNull: false
        },
        quantity: {
          type: new DataTypes.INTEGER(),
          allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'DeliveryItem',
        sequelize
      }
    );
  };
}
