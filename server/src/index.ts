import express from 'express';
import { User } from './models/user';
import { DatabaseService } from './services/database-service';
import { UserResponse, UserService } from './services/user-service';
import { RedisService } from './services/redis-service';
import { DeliveryService } from './services/delivery-service';
import {
  DeliveryAttemptData,
  DeliveryData,
  DeliveryDetailsData,
  DeliveryStatus
} from './types/delivery-types';
import { createRandomDelivery } from './services/dev-helper';

const PORT: number = parseInt(process.env.PORT || '8080');
const app = express();
const userService = new UserService();
const deliveryService = new DeliveryService();

app.use(express.json());
app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['userName', 'email', 'name'] });
  res.json(users);
});
app.get('/users/:userName', async (req, res) => {
  const user = await userService.getUser(req.params.userName);
  return user ? res.json(user) : res.status(404).send();
});

app.post('/users', async (req, res) => {
  try {
    const user = await User.create({
      userName: req.body.userName,
      email: req.body.email,
      name: req.body.name
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/batch/:count', async (req, res) => {
  try {
    for (let i = 0; i < +req.params.count; i++) {
      const deliveryResult = await deliveryService.createDelivery(createRandomDelivery());
      console.log(deliveryResult?.id);
    }
    res.status(201).json('ok');
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/delivery/search', async (req, res) => {
  try {
    const deliveries = await deliveryService.searchDeliveries({});
    res.json(deliveries);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/test-delivery', async (req, res) => {
  try {
    // for (let i = 0; i < 10000; i++) {
    //   const deliveryResult = await deliveryService.createDelivery(createRandomDelivery());
    //   console.log(deliveryResult?.id);
    // }
    const deliveryResult = await deliveryService.createDelivery(createRandomDelivery());
    res.status(201).json(deliveryResult);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/delivery/:deliveryId', async (req, res) => {
  try {
    const delivery = await deliveryService.GetDelivery(parseInt(req.params.deliveryId));
    return delivery ? res.json(delivery) : res.status(404).send();
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/delivery/attempt/:deliveryId', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.deliveryId);
    const attempt = await deliveryService.createNewDeliveryAttempt(
      deliveryId,
      DeliveryStatus.delivered
    );
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).send();
  }
});

app.get('/delivery/state-change/:deliveryId', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.deliveryId);
    const status = DeliveryStatus.delivered;
    const stateChange = await deliveryService.createNewDeliveryStateChange(deliveryId, status);
    res.status(201).json(stateChange);
  } catch (error) {
    res.status(500).send();
  }
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});

//curl -H 'Content-Type: application/json' -d '{ "userName": "newUser1234", "name": "New User", "email": "newuser@newstuser.com" }' -X POST http://localhost:8080/users
