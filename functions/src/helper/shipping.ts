import axios from "axios";
import { NEW_PICKUP, SHIPROCKET_CHANNELS } from "../constants";

export const addPickup = async (
  name: string,
  email: string,
  number: string,
  address: AddressType,
  store_id: string,
  index: number
) => {
  const shiprocket_access_token = process.env.SHIPROCKET_ACCESS_TOKEN;

  await axios.post(
    NEW_PICKUP,
    {
      pickup_location: `${store_id}_address_${index}`,
      name: name,
      email: email,
      phone: number,
      address: address.addressL1,
      address_2: address.addressL2,
      city: address.city,
      state: address.state,
      country: "India",
      pin_code: address.pincode,
    },
    {
      headers: {
        Authorization: "Bearer " + shiprocket_access_token,
      },
    }
  );
};

export const getChannelId = async () => {
  const shiprocket_access_token = process.env.SHIPROCKET_ACCESS_TOKEN;

  const response = await axios.get(SHIPROCKET_CHANNELS, {
    headers: {
      Authorization: "Bearer " + shiprocket_access_token,
    },
  });

  const channel_id = response.data.data[0].id;
  return channel_id;
};

export const createShipment = async (
  delivery_address: AddressType,
  order_id: string,
  product_id: string,
  store_id: string,
  channel_id: string,
  user: UserType,
  product: ProductType,
  store_phone_number: string
) => {
  const shiprocket_access_token = process.env.SHIPROCKET_ACCESS_TOKEN;
  const date = new Date();
  const formatted_date = date.toISOString().slice(0, 10);
  const formatted_time = `${date.getHours()}:${date.getMinutes()}`;

  const response = await axios.post(
    NEW_PICKUP,
    {
      order_id: order_id,
      order_date: `${formatted_date} ${formatted_time}`,
      channel_id: channel_id,
      billing_customer_name: user.name,
      billing_last_name: user.name?.split(" ")[1] ?? "",
      billing_address: delivery_address.addressL1,
      billing_city: delivery_address.city,
      billing_pincode: delivery_address.pincode,
      billing_state: delivery_address.state,
      billing_country: "India",
      billing_email: user.email,
      billing_phone: user.phone,
      shipping_is_billing: true,
      order_items: [
        {
          name: product.name,
          sku: product_id,
          units: 1,
          selling_price: product.amount,
        },
      ],
      payment_method: "Prepaid",
      sub_total: product.amount,
      length: 100,
      breadth: 50,
      height: 10,
      weight: 0.5,
      pickup_location: `${store_id}_address_1`,
      vendor_details: {
        email: "boldstore@gmail.com",
        phone: store_phone_number,
        name: "Bold",
        address: "Bold Store",
        address_2: "Head Office",
        city: "Delhi",
        state: "New Delhi",
        country: "India",
        pin_code: "110024",
        pickup_location: `${store_id}_address_1`,
      },
    },
    {
      headers: {
        Authorization: "Bearer " + shiprocket_access_token,
      },
    }
  );

  return response.status === 200;
};
