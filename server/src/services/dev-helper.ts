import { Model } from 'sequelize';
import { User, Role } from '../models';
import { faker } from '@faker-js/faker';
import {
  DeliveryAttemptData,
  DeliveryData,
  DeliveryDetailsData,
  DeliveryStatus,
  OrderData
} from '../types/delivery-types';

interface NewUser {
  email: string;
  name?: string;
  userName: string;
}

const prefillUserTable = async () => {
  const users: NewUser[] = [
    {
      email: 'beesona@gmail.com',
      name: 'Adam Beeson',
      userName: 'beesona'
    },
    {
      email: 'strtr@cer@hotmail.com',
      name: 'Myles',
      userName: 'streetracer'
    },
    {
      email: 'erinzaa@gmail.com',
      name: 'Erin',
      userName: 'erinzaa'
    },
    {
      email: 'john.doe@example.com',
      userName: 'johndoe123',
      name: 'John Doe'
    },
    {
      email: 'jane.smith@example.com',
      userName: 'janesmith456',
      name: 'Jane Smith'
    },
    {
      email: 'mike.jones@example.com',
      userName: 'mikejones789',
      name: 'Mike Jones'
    },
    {
      email: 'lisa.brown@example.com',
      userName: 'lisabrown321',
      name: 'Lisa Brown'
    },
    {
      email: 'david.lee@example.com',
      userName: 'davidlee654',
      name: 'David Lee'
    },
    {
      email: 'emily.davis@example.com',
      userName: 'emilydavis987',
      name: 'Emily Davis'
    },
    {
      email: 'chris.miller@example.com',
      userName: 'chrismiller111',
      name: 'Chris Miller'
    },
    {
      email: 'sarah.wilson@example.com',
      userName: 'sarahwilson222',
      name: 'Sarah Wilson'
    },
    {
      email: 'robert.moore@example.com',
      userName: 'robertmoore333',
      name: 'Robert Moore'
    },
    {
      email: 'laura.taylor@example.com',
      userName: 'laurataylor444',
      name: 'Laura Taylor'
    },
    {
      email: 'brian.anderson@example.com',
      userName: 'briananderson555',
      name: 'Brian Anderson'
    },
    {
      email: 'megan.thomas@example.com',
      userName: 'meganthomas666',
      name: 'Megan Thomas'
    },
    {
      email: 'steve.jackson@example.com',
      userName: 'stevejackson777',
      name: 'Steve Jackson'
    },
    {
      email: 'olivia.white@example.com',
      userName: 'oliviawhite888',
      name: 'Olivia White'
    },
    {
      email: 'kevin.harris@example.com',
      userName: 'kevinharris999',
      name: 'Kevin Harris'
    },
    {
      email: 'rachel.clark@example.com',
      userName: 'rachelclark000',
      name: 'Rachel Clark'
    },
    {
      email: 'ryan.rodriguez@example.com',
      userName: 'ryanrodriguez101',
      name: 'Ryan Rodriguez'
    },
    {
      email: 'anna.lewis@example.com',
      userName: 'annalewis202',
      name: 'Anna Lewis'
    },
    {
      email: 'jacob.walker@example.com',
      userName: 'jacobwalker303',
      name: 'Jacob Walker'
    },
    {
      email: 'samantha.hall@example.com',
      userName: 'samanthahall404',
      name: 'Samantha Hall'
    }
  ];
  for (const user of users) {
    const newUser = await User.create(user);
    await newUser.addRole(2);
  }
};
const prefillRoleTable = async () => {
  const roles: string[] = ['admin', 'user', 'guest'];
  for (const role of roles) {
    await Role.create({ role });
  }
};

const createRandomDelivery = (): DeliveryData => {
  const deliveryDetails: DeliveryDetailsData = {
    fromContactName: faker.person.fullName(),
    toContactName: faker.person.fullName(),
    fromInstructions: faker.lorem.sentence(),
    toInstructions: faker.lorem.sentence(),
    fromAddress: faker.location.streetAddress(),
    fromCity: faker.location.city(),
    fromState: faker.location.state(),
    fromZip: faker.location.zipCode(),
    fromCountry: 'USA',
    fromPhoneNumber: faker.phone.number(),
    toAddress: faker.location.streetAddress(),
    toCity: faker.location.city(),
    toState: faker.location.state(),
    toZip: faker.location.zipCode(),
    toCountry: 'USA',
    toPhoneNumber: faker.phone.number()
  };

  const deliveryAttempts: DeliveryAttemptData[] = [
    {
      status: DeliveryStatus.draft,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const orderData: OrderData = {
    organizationId: faker.number.int({ min: 1, max: 20 })
  };

  const delivery: DeliveryData = {
    deliveryType: 'BUSINESS',
    notes: faker.lorem.sentence(),
    status: DeliveryStatus.draft,
    dispatchAt: new Date(),
    mileage: faker.number.int({ min: 5, max: 100 }),
    deliveryDetails,
    deliveryAttempts,
    order: orderData
  };

  return delivery;
};

export { NewUser, prefillUserTable, prefillRoleTable, createRandomDelivery };
