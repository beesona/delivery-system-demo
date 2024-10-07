import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize
} from 'sequelize';
import { tableSettings } from '../services/database-service';

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare role: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel = async (sequelize: Sequelize) => {
    Role.init(
      {
        role: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'Role',
        sequelize
      }
    );
  };
}
