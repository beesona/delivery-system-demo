enum DeliveryStatus {
  draft = "draft",
  readyForDispatch = "readyForDispatch",
  dispatching = "dispatching",
  scheduled = "scheduled",
  assigned = "assigned",
  acceptedByLp = "acceptedByLp",
  canceledByLp = "canceledByLp",
  driverAssigned = "driverAssigned",
  enRouteToPickup = "enRouteToPickup",
  arrivedForPickup = "arrivedForPickup",
  enRouteToDelivery = "enRouteToDelivery",
  arrivedForDelivery = "arrivedForDelivery",
  delivered = "delivered",
  canceledByShipper = "canceledByShipper"
}

interface IData {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderData extends IData {
  organizationId: number;
}

interface DeliveryData extends IData {
  deliveryType: string;
  notes: string;
  status: DeliveryStatus;
  dispatchAt: Date;
  mileage: number;
  orderId?: number;
  order?: OrderData;
  deliveryAttempts?: DeliveryAttemptData[];
  deliveryDetails?: DeliveryDetailsData;
}

interface DeliveryAttemptData extends IData {
  status: DeliveryStatus;
  deliveryStateChanges?: DeliveryStateChangeData[];
}

interface DeliveryStateChangeData extends IData {
  state: DeliveryStatus;
}

interface OrderItemData extends IData {
  description: string;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLbs: number;
  quantity: number;
}

interface DeliveryDetailsData extends IData {
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
}

export {
  IData,
  DeliveryStatus,
  OrderData,
  DeliveryData,
  DeliveryAttemptData,
  DeliveryStateChangeData,
  OrderItemData,
  DeliveryDetailsData
};
