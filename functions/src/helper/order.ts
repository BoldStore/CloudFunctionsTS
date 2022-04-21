import { createHmac } from "crypto";
import { firestore } from "firebase-admin";
import { RAZORPAY_SECRET } from "../secrets";

export const confirmOrder = async (
  paymentId: string,
  orderId: string,
  razorpaySignature: string,
  userId: string
) => {
  const keySecret: string = RAZORPAY_SECRET!.toString();

  const order = await firestore()
    .collection("orders")
    .where("orderId", "==", orderId)
    .where("user", "==", userId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0];
    });

  if (!order) {
    return {
      message: "Order not found",
    };
  }

  if (order!.data().confirmed) {
    return {
      success: false,
      message: "Order already confirmed",
    };
  }

  // Creating hmac object
  const hmac = createHmac("sha256", keySecret);

  // Passing the data to be hashed
  hmac.update(orderId + "|" + paymentId);

  // Creating the hmac in the required format
  const generatedSignature = hmac.digest("hex");

  if (razorpaySignature === generatedSignature) {
    await firestore().collection("orders").doc(order!.id!).set(
      {
        paymentId: paymentId,
        confirmed: true,
      },
      { merge: true }
    );

    // TODO: Ship product
    // TODO: Send Email to user
  } else {
    return {
      success: false,
      message: "Invalid signature",
    };
  }
  return {
    success: true,
    order,
  };
};
