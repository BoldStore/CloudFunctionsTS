/* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";
import { firestore } from "firebase-admin";
// import { RAZORPAY_URL } from "../constants";
// import { RAZORPAY_ACCOUNT, RAZORPAY_KEY, RAZORPAY_SECRET } from "../secrets";

interface PayoutResponse {
  success: boolean;
  error: any;
  data: any;
}

export const createPayout: (
  order_id: string
) => Promise<PayoutResponse> = async (order_id) => {
  let error = null;
  let success = false;
  let data = null;

  const order = await firestore().collection("orders").doc(order_id).get();

  // const store = await firestore()
  //   .collection("stores")
  //   .doc(order.data()?.store)
  //   .get();

  const paymentDetails = await firestore()
    .collection("paymentDetails")
    .doc(order.data()?.store)
    .get();

  try {
    // const body = {
    //   account_number: RAZORPAY_ACCOUNT,
    //   amount: order.data()?.amount ?? 1 * 100,
    //   currency: order.data()?.currency,
    //   mode: "UPI",
    //   purpose: "payout",
    //   fund_account: {
    //     account_type: "vpa",
    //     vpa: {
    //       address: paymentDetails.data()?.upi_id,
    //     },
    //     contact: {
    //       name: store.data()?.full_name ?? store.data()?.username,
    //       email: store.data()?.email,
    //       contact: paymentDetails.data()?.phone,
    //       type: "vendor",
    //       reference_id: `Bold Order ID ${
    //         order.data()?.shiprocket_order_id ?? order.id
    //       }`,
    //       notes: {
    //         productId: `Product ${order.data()?.product}`,
    //       },
    //     },
    //   },
    //   queue_if_low_balance: true,
    //   reference_id: "Bold Payout",
    //   narration: "Bold Product Sold",
    // };

    // const response = await axios.post(RAZORPAY_URL + "/payouts", body, {
    //   auth: {
    //     username: RAZORPAY_KEY,
    //     password: RAZORPAY_SECRET,
    //   },
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    const transaction_data = {
      payout_id: "response.data.id",
      fund_account_id: "response.data.fund_account.id",
      contact_id: "response.data.fund_account.contact.id",
      createdAt: firestore.Timestamp.now(),
      amount: order.data()?.amount ?? 1 * 100,
      currency: "INR",
      mode: "response.data.mode",
      merchant_id: "response.data.merchant_id",
      order: order_id,
      store: order.data()?.store,
      product: order.data()?.product,
      payout_to: paymentDetails?.data()?.upi_id,
    };

    // Create transaction
    const transaction = await firestore()
      .collection("transactions")
      .add(transaction_data);

    data = {
      ...transaction_data,
      transaction_id: transaction.id,
    };
    success = true;
  } catch (e) {
    console.log("Razorpay payout error: ", (e as any)?.response?.data ?? e);
    error = (e as any)?.response?.data ?? e;
    success = false;
  }

  return {
    success,
    error,
    data,
  };
};
