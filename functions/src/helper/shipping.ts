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
