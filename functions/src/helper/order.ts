import { createHmac } from "crypto";
import { firestore } from "firebase-admin";
import { RAZORPAY_SECRET } from "../secrets";
import { sendMail } from "./mails";
import { createShipment } from "./shipping";

export const confirmOrder = async (
  paymentId: string,
  orderId: string,
  razorpaySignature: string,
  userId: string,
  user: any
) => {
  try {
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

    if (!order?.exists) {
      return {
        message: "Order not found",
      };
    }

    if (order!.data().confirmed) {
      return {
        success: true,
        message: "Order already confirmed",
        order,
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

      await firestore()
        .collection("products")
        .doc(order!.data().product)
        .update({
          sold: true,
        });

      await createShipment(
        order!.data().address,
        orderId,
        order!.data().product,
        order!.data().store,
        user!
      );

      await sendMail(
        user!.email,
        "Product Bought",
        "You just bought a product",
        "/templates/product_bought.html"
      );
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
  } catch (e) {
    console.log("Error>>>", e);
    return {
      success: false,
      message: `There was an error: ${e}`,
    };
  }
};
