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

export { DebeziumData, Delivery, DeliveryDetails, DeliveryAttempt, DeliveryStateChange, Order };
