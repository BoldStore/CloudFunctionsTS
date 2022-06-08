/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable operator-linebreak */
import axios from "axios";
import { firestore } from "firebase-admin";
import {
  CREATE_SHIPMENT,
  NEW_PICKUP,
  SHIPROCKET_CHANNELS,
} from "../../constants";
import { AddressType } from "../../models/Address";

export const addPickup: (
  name: string,
  email: string,
  number: string,
  address: AddressType,
  store_id: string
) => Promise<boolean> = async (
  name: string,
  email: string,
  number: string,
  address: AddressType,
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
        phone: number ?? "9876543210",
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
    console.log("Shiprocket pickup error: ", (e as any).response.data);
    return false;
  }
};

export const getChannelId: (shiprocket_access_token: string) => Promise<{
  channel_id: string | null;
  error: any;
}> = async (shiprocket_access_token) => {
  try {
    const response = await axios.get(SHIPROCKET_CHANNELS, {
      headers: {
        Authorization: "Bearer " + shiprocket_access_token,
      },
    });

    const channel_id = response.data.data[0].id;
    return {
      channel_id,
      error: null,
    };
  } catch (e) {
    console.log("Shiprocket channel error: ", (e as any).response.data);
    return {
      error: (e as any).response.data,
      channel_id: null,
    };
  }
};

export const createShipment: (
  address_id: string,
  order_id: string,
  product_id: string,
  store_id: string,
  user: firestore.DocumentData
) => Promise<{ success: boolean; error: any; data?: any }> = async (
  address_id: string,
  order_id: string,
  product_id: string,
  store_id: string,
  user: firestore.DocumentData
) => {
  let address = null;
  let phone: number | null = null;

  if (!user.phone) {
    const paymentDetails = await firestore()
      .collection("paymentDetails")
      .doc(user.id)
      .get();

    if (!paymentDetails.exists) {
      return {
        success: false,
        error: "No phone number found",
      };
    }
    phone = paymentDetails.data()?.phone_number;
  }
  const product = (
    await firestore().collection("products").doc(product_id).get()
  ).data();

  const addressFromDb = await firestore()
    .collection("addresses")
    .doc(address_id)
    .get();

  if (!addressFromDb || !addressFromDb?.exists) {
    return {
      success: false,
      error: "Address not found",
    };
  }

  address = addressFromDb?.data();

  const seller = (
    await firestore().collection("stores").doc(product?.store).get()
  ).data();

  const config = (await firestore().collection("config").limit(1).get())
    .docs[0];
  const shiprocket_access_token = config.data().shiprocket_access_token;
  const date = new Date();
  const formatted_date = date.toISOString().slice(0, 10);
  const formatted_time = `${date.getHours()}:${date.getMinutes()}`;

  const channel_id_data = await getChannelId(shiprocket_access_token);

  if (channel_id_data.error) {
    return {
      success: false,
      error: channel_id_data.error,
    };
  }

  const channel_id = channel_id_data.channel_id;

  try {
    const response = await axios.post(
      CREATE_SHIPMENT,
      {
        order_id: order_id,
        order_date: `${formatted_date} ${formatted_time}`,
        channel_id: channel_id,
        billing_customer_name: user.name ?? user.full_name,
        billing_last_name: user.name
          ? user.name?.split(" ").length >= 1
            ? user.name?.split(" ")[1]
            : ""
          : user.full_name?.split(" ").length >= 1
          ? user.full_name?.split(" ")[1]
          : "",
        billing_address: address?.addressL1,
        billing_city: address?.city,
        billing_pincode: address?.pincode,
        billing_state: address?.state,
        billing_country: "India",
        billing_email: user.email,
        billing_phone: user.phone ?? phone ?? "9899999999",
        shipping_is_billing: true,
        order_items: [
          {
            name: product?.name
              ? product?.name
              : `Product by ${seller?.full_name}`,
            sku: product_id,
            units: 1,
            selling_price: product?.amount ? product?.amount : 1000,
          },
        ],
        payment_method: "Prepaid",
        sub_total: product?.amount ? product?.amount : 1000,
        length: 100,
        breadth: 50,
        height: 10,
        weight: 0.5,
        pickup_location: store_id,
        phone: seller?.phone,
        reseller_name: "Bold",
        name: seller?.full_name ?? "Bold Store",
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

    return {
      success: true,
      error: null,
      data: response.data,
    };
  } catch (e) {
    console.log("Shiprocket shipment error: ", (e as any).response.data);
    return {
      success: false,
      error: (e as any).response.data,
    };
  }
};
