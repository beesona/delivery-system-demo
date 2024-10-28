interface DebeziumData {
  id: number;
  created_at: Date;
  updated_at: Date;
  tx_id?: number;
  op?: 'c' | 'u' | 'd';
}

interface Delivery extends DebeziumData {
  order_id: number;
  mileage: number;
  delivery_type: string;
  notes: string;
  status: string;
  dispatch_at: Date;
}

interface DeliveryDetails extends DebeziumData {
  delivery_id: number;
  from_instructions: string;
  from_contact_name: string;
  from_phone_number: string;
  from_address: string;
  from_city: string;
  from_state: string;
  from_zip: string;
  from_country: string;
  to_instructions: string;
  to_contact_name: string;
  to_phone_number: string;
  to_address: string;
  to_city: string;
  to_state: string;
  to_zip: string;
  to_country: string;
}

interface DeliveryAttempt extends DebeziumData {
  delivery_id: number;
  status: string;
}

interface DeliveryStateChange extends DebeziumData {
  delivery_attempt_id: number;
  state: string;
}

interface Order extends DebeziumData {
  organization_id: number;
}

interface FullDelivery {
  DELIVERY_ID: number;
  DELIVERY_TYPE: string;
  NOTES: string;
  STATUS: string;
  DISPATCH_AT: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  MILEAGE: number;
  ORDER_ID?: number;
  ORGANIZATION_ID: number;
  FROM_INSTRUCTIONS: string;
  FROM_CONTACT_NAME: string;
  TO_INSTRUCTIONS: string;
  TO_CONTACT_NAME: string;
  FROM_ADDRESS: string;
  FROM_CITY: string;
  FROM_STATE: string;
  FROM_ZIP: string;
  FROM_COUNTRY: string;
  FROM_PHONE_NUMBER: string;
  TO_ADDRESS: string;
  TO_CITY: string;
  TO_STATE: string;
  TO_ZIP: string;
  TO_COUNTRY: string;
  TO_PHONE_NUMBER: string;
  LATEST_DELIVERY_ATTEMPT?: DeliveryAttempt;
}

export {
  DebeziumData,
  Delivery,
  DeliveryDetails,
  DeliveryAttempt,
  DeliveryStateChange,
  Order,
  FullDelivery
};
