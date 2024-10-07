import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  Association,
  NonAttribute
} from 'sequelize';
import { Role } from './role';
import { tableSettings } from '../services/database-service';

export class User extends Model<
  InferAttributes<User, { omit: 'roles' }>,
  InferCreationAttributes<User, { omit: 'roles' }>
> {
  declare email: string;
  declare name: CreationOptional<string>;
  declare userName?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getRoles: HasManyGetAssociationsMixin<Role>;
  declare addRole: HasManyAddAssociationMixin<Role, number>;
  declare addRoles: HasManyAddAssociationsMixin<Role, number>;
  declare setRoles: HasManySetAssociationsMixin<Role, number>;
  declare removeRole: HasManyRemoveAssociationMixin<Role, number>;
  declare removeRoles: HasManyRemoveAssociationsMixin<Role, number>;
  declare hasRole: HasManyHasAssociationMixin<Role, number>;
  declare hasRoles: HasManyHasAssociationsMixin<Role, number>;
  declare countRoles: HasManyCountAssociationsMixin;
  declare createRole: HasManyCreateAssociationMixin<Role>;

  declare roles?: NonAttribute<Role[]>;
  declare static associations: { roles: Association<User, Role> };

  static initModel = async (sequelize: Sequelize) => {
    User.init(
      {
        email: {
          type: new DataTypes.STRING(128),
          allowNull: false,
          unique: true
        },
        name: {
          type: new DataTypes.STRING(128),
          allowNull: true
        },
        userName: {
          type: new DataTypes.STRING(128),
          allowNull: false,
          unique: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        ...tableSettings,
        modelName: 'User',
        sequelize
      }
    );
  };
}
