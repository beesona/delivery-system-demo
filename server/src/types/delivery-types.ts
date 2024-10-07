enum DeliveryStatus {
  draft = 'draft',
  readyForDispatch = 'readyForDispatch',
  dispatching = 'dispatching',
  scheduled = 'scheduled',
  assigned = 'assigned',
  acceptedByLp = 'acceptedByLp',
  canceledByLp = 'canceledByLp',
  driverAssigned = 'driverAssigned',
  enRouteToPickup = 'enRouteToPickup',
  arrivedForPickup = 'arrivedForPickup',
  enRouteToDelivery = 'enRouteToDelivery',
  arrivedForDelivery = 'arrivedForDelivery',
  delivered = 'delivered',
  canceledByShipper = 'canceledByShipper'
}

interface OrderData {
  id?: number;
  organizationId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeliveryData {
  id?: number;
  deliveryType: string;
  notes: string;
  status: DeliveryStatus;
  dispatchAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  mileage: number;
  orderId?: number;
  order?: OrderData;
  deliveryAttempts?: DeliveryAttemptData[];
  deliveryDetails?: DeliveryDetailsData;
}

interface DeliveryAttemptData {
  id?: number;
  status: DeliveryStatus;
  deliveryStateChanges?: DeliveryStateChangeData[];
  createdAt: Date;
  updatedAt: Date;
}

interface DeliveryStateChangeData {
  id?: number;
  state: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemData {
  id?: number;
  description: string;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLbs: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeliveryDetailsData {
  id?: number;
  deliveryId?: number;
  fromInstructions?: string;
  fromContactName: string;
  toInstructions?: string;
  toContactName: string;
  fromAddress: string;
  fromCity: string;
  fromState: string;
  fromZip: string;
  fromCountry: string;
  fromPhoneNumber: string;
  toAddress: string;
  toCity: string;
  toState: string;
  toZip: string;
  toCountry: string;
  toPhoneNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export {
  DeliveryStatus,
  OrderData,
  DeliveryData,
  DeliveryAttemptData,
  DeliveryStateChangeData,
  OrderItemData,
  DeliveryDetailsData
};
