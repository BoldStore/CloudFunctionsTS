import axios from "axios";
import { firestore } from "firebase-admin";
import { CREATE_SHIPMENT, NEW_PICKUP, SHIPROCKET_CHANNELS } from "../constants";

export const addPickup = async (
  name: string,
  email: string,
  number: string,
  address: {
    address: string;
    title: string;
    addressL1: string;
    addressL2: string;
    city: string;
    state: string;
    pincode: number;
    user: string;
    notes?: string;
  },
  store_id: string
) => {
  try {
    const config = (await firestore().collection("config").get()).docs[0];
    const shiprocket_access_token = config.data().shiprocket_access_token;

    const response = await axios.post(
      NEW_PICKUP,
      {
        pickup_location: store_id,
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

    return response.data.success;
  } catch (e) {
    console.log("Shiprocket pickup error: ", e);
    return false;
  }
};

export const getChannelId = async () => {
  const config = (await firestore().collection("config").get()).docs[0];
  const shiprocket_access_token = config.data().shiprocket_access_token;

  const response = await axios.get(SHIPROCKET_CHANNELS, {
    headers: {
      Authorization: "Bearer " + shiprocket_access_token,
    },
  });

  const channel_id = response.data.data[0].id;
  return channel_id;
};

export const createShipment = async (
  address_id: string,
  order_id: string,
  product_id: string,
  store_id: string,
  user: firestore.DocumentData
) => {
  const product = (
    await firestore().collection("products").doc(product_id).get()
  ).data();

  const address = (
    await firestore().collection("addresses").doc(address_id).get()
  ).data();

  const seller = (
    await firestore().collection("stores").doc(product!.store).get()
  ).data();

  const config = (await firestore().collection("config").get()).docs[0];
  const shiprocket_access_token = config.data().shiprocket_access_token;
  const date = new Date();
  const formatted_date = date.toISOString().slice(0, 10);
  const formatted_time = `${date.getHours()}:${date.getMinutes()}`;

  const channel_id = await getChannelId();

  const response = await axios.post(
    CREATE_SHIPMENT,
    {
      order_id: order_id,
      order_date: `${formatted_date} ${formatted_time}`,
      channel_id: channel_id,
      billing_customer_name: user.name,
      billing_last_name:
        user.name?.split(" ").length >= 1 ? user.name?.split(" ")[1] : "",
      billing_address: address!.addressL1,
      billing_city: address!.city,
      billing_pincode: address!.pincode,
      billing_state: address!.state,
      billing_country: "India",
      billing_email: user.email,
      billing_phone: user.phone,
      shipping_is_billing: true,
      order_items: [
        {
          name: product!.name ?? `Product by ${seller!.full_name}`,
          sku: product_id,
          units: 1,
          selling_price: product!.amount ?? 1000,
        },
      ],
      payment_method: "Prepaid",
      sub_total: product!.amount ?? 1000,
      length: 100,
      breadth: 50,
      height: 10,
      weight: 0.5,
      pickup_location: store_id,
      // vendor_details: {
      //   email: "boldstore@gmail.com",
      //   phone: seller!.phone,
      //   name: "Bold",
      //   address: "Bold Store, Flat number 8",
      //   address_2: "Head Office",
      //   city: "Delhi",
      //   state: "New Delhi",
      //   country: "India",
      //   pin_code: "110024",
      //   pickup_location: `${store_id}_address`,
      // },
      phone: seller!.phone,
      name: "Bold",
      address: "Bold Store, Road no. 8",
      address_2: "Head Office",
      city: "Delhi",
      state: "New Delhi",
      country: "India",
      pin_code: "110024",
      email: "boldstore@gmail.com",
    },
    {
      headers: {
        Authorization: "Bearer " + shiprocket_access_token,
      },
    }
  );

  return response.status === 200;
};
