/* eslint-disable require-jsdoc */
export class Order {
  product: string;
  amount: string;
  status: string;
  orderId: string;
  address: string;
  currency: string;
  store: string;
  createdAt: Date;
  confirmedOn?: Date | null;
  paymentId?: string | null;
  user?: string | null;
  label_url?: string | null;
  manifest_url?: string | null;
  pickup_scheduled_date?: {
    date: string;
    timezone_type: string;
    timezone: string;
  } | null;
  shiprocket_order_id?: string | null;
  shipment_id?: string | null;
  awb_code?: string | null;
  courier_company_id?: number | null;
  courier_name?: string | null;
  assigned_date_time?: {
    date: string;
    timezone_type: string;
    timezone: string;
  } | null;
  routing_code?: string | null;
  pickup_token_number?: string | null;
  applied_weight?: number | null;

  constructor(
    product: string,
    amount: string,
    status = "pending",
    orderId: string,
    address: string,
    currency = "INR",
    store: string,
    paymentId: string | null = null,
    createdAt: Date = new Date(),
    confirmedOn: Date | null = null,
    user: string | null = null,
    label_url: string | null = null,
    manifest_url: string | null = null,
    pickup_scheduled_date: {
      date: string;
      timezone_type: string;
      timezone: string;
    } | null = null,
    shiprocket_order_id: string | null = null,
    shipment_id: string | null = null,
    awb_code: string | null = null,
    courier_company_id: number | null = null,
    courier_name: string | null = null,
    assigned_date_time: {
      date: string;
      timezone_type: string;
      timezone: string;
    } | null = null,
    routing_code: string | null = null,
    pickup_token_number: string | null = null,
    applied_weight: number | null = null
  ) {
    this.product = product;
    this.amount = amount;
    this.status = status;
    this.orderId = orderId;
    this.address = address;
    this.currency = currency;
    this.store = store;
    this.createdAt = createdAt;
    this.confirmedOn = confirmedOn;
    this.paymentId = paymentId;
    this.user = user;
    this.label_url = label_url;
    this.manifest_url = manifest_url;
    this.pickup_scheduled_date = pickup_scheduled_date;
    this.shiprocket_order_id = shiprocket_order_id;
    this.shipment_id = shipment_id;
    this.awb_code = awb_code;
    this.courier_company_id = courier_company_id;
    this.courier_name = courier_name;
    this.assigned_date_time = assigned_date_time;
    this.routing_code = routing_code;
    this.pickup_token_number = pickup_token_number;
    this.applied_weight = applied_weight;

    return {
      product: this.product,
      amount: this.amount,
      status: this.status,
      orderId: this.orderId,
      address: this.address,
      currency: this.currency,
      store: this.store,
      createdAt: this.createdAt,
      paymentId: this.paymentId,
      user: this.user,
      label_url: this.label_url,
      manifest_url: this.manifest_url,
      pickup_scheduled_date: this.pickup_scheduled_date,
      shiprocket_order_id: this.shiprocket_order_id,
      shipment_id: this.shipment_id,
      awb_code: this.awb_code,
      courier_company_id: this.courier_company_id,
      courier_name: this.courier_name,
      assigned_date_time: this.assigned_date_time,
      routing_code: this.routing_code,
      pickup_token_number: this.pickup_token_number,
      applied_weight: this.applied_weight,
    };
  }
}

export interface OrderType {
  product: string;
  amount: string;
  status: string;
  orderId: string;
  address: string;
  currency: string;
  store: string;
  createdAt: Date;
  paymentId?: string | null;
  user?: string | null;
  label_url?: string | null;
  manifest_url?: string | null;
  pickup_scheduled_date?: {
    date: string;
    timezone_type: string;
    timezone: string;
  } | null;
  shiprocket_order_id?: string | null;
  shipment_id?: string | null;
  awb_code?: string | null;
  courier_company_id?: number | null;
  courier_name?: string | null;
  assigned_date_time?: {
    date: string;
    timezone_type: string;
    timezone: string;
  } | null;
  routing_code?: string | null;
  pickup_token_number?: string | null;
  applied_weight?: number | null;
}
