/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from "crypto";
import { firestore } from "firebase-admin";
import { RAZORPAY_SECRET } from "../../secrets";
import { sendMail } from "../mails";
import { createPayout } from "../payments";
import { createShipment } from "./shipping";

interface ConfirmOrderResponse {
  success: boolean;
  message: string;
  error?: any;
  order?: any;
  type?: string;
}

export const confirmOrder: (
  paymentId: string,
  orderId: string,
  razorpaySignature: string,
  userId: string,
  user?: firestore.DocumentData
) => Promise<ConfirmOrderResponse> = async (
  paymentId: string,
  orderId: string,
  razorpaySignature: string,
  userId: string,
  user
) => {
  let orderData = null;
  try {
    const keySecret: string = RAZORPAY_SECRET?.toString();

    const order = (
      await firestore()
        .collection("orders")
        .where("orderId", "==", orderId)
        .where("user", "==", userId)
        .limit(1)
        .get()
    ).docs[0];

    if (!order?.exists) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    if (order.data().status === "completed") {
      return {
        success: true,
        message: "Order already completed",
        order: order.data(),
      };
    }

    // Creating hmac object
    const hmac = createHmac("sha256", keySecret);

    // Passing the data to be hashed
    hmac.update(orderId + "|" + paymentId);

    // Creating the hmac in the required format
    const generatedSignature = hmac.digest("hex");

    if (razorpaySignature === generatedSignature) {
      const data = await createShipment(
        order?.data().address,
        orderId,
        order?.data().product,
        order?.data().store,
        user
      );

      const transaction = await createPayout(order.id);

      if (data.error) {
        // TODO: Handle orders with shipping errors
        const send_data = {
          paymentId: paymentId,
          status: "error",
          confirmedOn: new Date(),
          error: data.error,
          transaction_id: transaction?.data?.id,
          transaction_error: transaction.error,
        };
        await firestore()
          .collection("orders")
          .doc(order?.id)
          .set(send_data, { merge: true });

        await firestore()
          .collection("products")
          .doc(order?.data().product)
          .update({
            sold: true,
          });

        return {
          success: false,
          message: "Error creating shipment",
          error: data.error,
          type: "SHIPMENT_ERROR",
        };
      }

      await firestore()
        .collection("orders")
        .doc(order?.id)
        .set(
          {
            paymentId: paymentId,
            status: "confirmed",
            confirmedOn: new Date(),
            label_url: data?.data?.payload?.label_url ?? "",
            manifest_url: data?.data?.payload?.manifest_url ?? "",
            pickup_schedule_date:
              data?.data?.payload?.pickup_schedule_date ?? "",
            shiprocket_order_id: data?.data?.payload?.order_id ?? "",
            shipment_id: data?.data?.payload?.shipment_id ?? "",
            awb_code: data?.data?.payload?.awb_code ?? "",
            courier_company_id: data?.data?.payload?.courier_company_id ?? "",
            courier_name: data?.data?.payload?.courier_name ?? "",
            assigned_date_time: data?.data?.payload?.assigned_date_time ?? "",
            routing_code: data?.data?.payload?.routing_code ?? "",
            pickup_token_number: data?.data?.payload?.pickup_token_number ?? "",
            applied_weight: data?.data?.payload?.applied_weight ?? "",
            transaction_id: transaction?.data?.id,
            transaction_error: transaction.error,
          },
          { merge: true }
        );

      await firestore()
        .collection("products")
        .doc(order?.data().product)
        .update({
          sold: true,
        });

      // Get Order
      orderData = await firestore().collection("orders").doc(order?.id).get();

      // TODO: Send whatsapp message
      await sendMail(
        user?.email,
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
      message: "Order confirmed",
      order: orderData,
    };
  } catch (e) {
    console.log("Error>>>", e);
    return {
      success: false,
      message: `There was an error: ${e}`,
      error: e,
    };
  }
};
