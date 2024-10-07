import { Model, Sequelize } from 'sequelize';
import { RedisService } from './redis-service';
import { prefillUserTable, prefillRoleTable } from './dev-helper';
import {
  Delivery,
  DeliveryAttempt,
  DeliveryStateChange,
  Order,
  User,
  Role,
  DeliveryDetails,
  DeliveryItem
} from '../models';

export const tableSettings = {
  underscored: true
};

const connectionString = `postgres://postgres:example@localhost:5432/postgres`;

class DatabaseService {
  static #instance: DatabaseService;

  public static get instance(): DatabaseService {
    if (!DatabaseService.#instance) {
      DatabaseService.#instance = new DatabaseService();
      this.#instance.initializeModels();
    }

    return DatabaseService.#instance;
  }

  redisService = new RedisService();

  sequelize = new Sequelize('postgres', 'postgres', 'example', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  });
  constructor() {
    (async () => {
      await this.redisService.connect();
    })();
  }
  async initializeModels() {
    await User.initModel(this.sequelize);
    await Role.initModel(this.sequelize);
    await Delivery.initModel(this.sequelize);
    await DeliveryDetails.initModel(this.sequelize);
    await DeliveryAttempt.initModel(this.sequelize);
    await DeliveryStateChange.initModel(this.sequelize);
    await DeliveryItem.initModel(this.sequelize);
    await Order.initModel(this.sequelize);
    await this.createAssociations();

    if (process.env.NODE_ENV === 'development') {
      try {
        await this.syncDb(this.sequelize);
        await prefillRoleTable();
        await prefillUserTable();
      } catch (error) {
        console.log(error);
      }
    }
  }
  async syncDb(sequelize: Sequelize) {
    await sequelize.sync({ force: true });
  }

  async createAssociations() {
    User.belongsToMany(Role, { through: 'UserRoles', as: 'roles' });
    Role.belongsToMany(User, { through: 'UserRoles', as: 'users' });

    Delivery.hasMany(DeliveryAttempt, { as: 'deliveryAttempts' });
    Delivery.hasOne(DeliveryDetails, {
      as: 'deliveryDetails',
      sourceKey: 'id',
      foreignKey: 'deliveryId'
    });
    Delivery.hasMany(DeliveryItem, {
      as: 'deliveryItems',
      sourceKey: 'id',
      foreignKey: 'deliveryId'
    });
    DeliveryAttempt.hasMany(DeliveryStateChange, {
      sourceKey: 'id',
      foreignKey: 'deliveryAttemptId',
      as: 'stateChanges'
    });
    Order.hasMany(Delivery, { sourceKey: 'id', foreignKey: 'orderId', as: 'deliveries' });
  }
}

export { DatabaseService };
