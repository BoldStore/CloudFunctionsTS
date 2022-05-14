import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { razorpayInstance } from ".";
import { confirmOrder } from "./helper/order";
import axios from "axios";
import { SHIPROCKET_SERVICEABILITY } from "./constants";
import { sendMail } from "./helper/mails";
import { createShipment } from "./helper/shipping";
import { checkAuth } from "./helper/check_auth";

exports.createOrder = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const product_id: string = req.body.product_id;
      const address_id: string = req.body.address_id;
      const currency = "INR";
      const id = (await checkAuth(req, res))!.userId!;

      const product = await firestoredb()
        .collection("products")
        .doc(product_id)
        .get();

      if (!product.exists) {
        res.status(400).json({
          message: "Product not found",
        });
        return;
      }

      if (product.data() && !product.data()!.sold) {
        res.status(400).json({
          sucsess: false,
          message: "Product is sold out",
        });
        return;
      }

      if (product.data() && product.data()!.available) {
        res.status(400).json({
          sucsess: false,
          message: "Product is not available",
        });
        return;
      }
      // TODO: Check if product is available on insta

      // Make the product unavailable
      await firestoredb().collection("products").doc(product.id).update({
        available: false,
      });

      // Add to razorpay
      await razorpayInstance.orders
        .create({ amount: product.data()!.price ?? 1000, currency: currency })
        .then(async (order) => {
          const order_obj = {
            product: product.id,
            amount: product.data()!.price ?? 1000,
            createdAt: new Date(),
            confirmed: false,
            orderId: order.id,
            user: id,
            address: address_id,
            currency,
            // seller: product.data()!.seller,
            store: product.data()!.store,
          };

          await firestoredb().collection("orders").add(order_obj);
          res.status(201).json({ success: true, order: order_obj });
        });
    } catch (e) {
      console.log("ERROR>", e);
      res.status(500).json({
        success: false,
        message: "Could not create the order",
        error: e,
      });
    }
  }
);

exports.verifyOrder = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const paymentId = req.body.razorpay_payment_id;
      const orderId = req.body.razorpay_order_id;
      const razorpaySignature = req.body.razorpay_signature;

      console.log("RESPONSE>>", req.body);

      const id = (await checkAuth(req, res))!.userId!;
      const user = (
        await firestoredb().collection("users").doc(id).get()
      ).data();

      const response = await confirmOrder(
        paymentId,
        orderId,
        razorpaySignature,
        id
      );

      if (response.success) {
        // Set Product to sold
        await firestoredb()
          .collection("products")
          .doc(response.order!.data().product)
          .update({
            sold: true,
          });

        await createShipment(
          response.order!.data().address,
          orderId,
          response.order!.data().product,
          response.order!.data().store,
          user!
        );
        await sendMail(
          user!.email,
          "Product Bought",
          "You just bought a product",
          "/templates/product_bought.html"
        );
        res.status(200).json({
          success: true,
          message: "Order confirmed",
        });
      } else {
        res.status(400).json({
          success: false,
          message: response.message,
        });
      }
    } catch (e) {
      console.log("ERROR>", e);
      res.status(500).json({
        success: false,
        message: "Could not verify the order",
        error: e,
      });
    }
  }
);

exports.callback = https.onRequest(async (req: Request, res: Response<any>) => {
  try {
    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id;
    const razorpaySignature = req.body.razorpay_signature;

    console.log("RESPONSE>>", req.body);

    const id = req.query.id!.toString();
    const user = (await firestoredb().collection("users").doc(id).get()).data();

    const response = await confirmOrder(
      paymentId,
      orderId,
      razorpaySignature,
      id
    );

    if (response.success) {
      // Set Product to sold
      await firestoredb()
        .collection("products")
        .doc(response.order!.data().product)
        .update({
          sold: true,
        });

      await createShipment(
        response.order!.data().address,
        orderId,
        response.order!.data().product,
        response.order!.data().store,
        user!
      );
      sendMail(
        user!.email,
        "Product Bought",
        "You just bought a product",
        "/templates/product_bought.html"
      );
      res.status(200).json({
        success: true,
        message: "Order confirmed",
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.message,
      });
    }
  } catch (e) {
    console.log("ERROR>", e);
    res.status(500).json({
      success: false,
      message: `Callback Verification Failed`,
      error: e,
    });
  }
});

exports.previousOrders = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

      const orders = await firestoredb()
        .collection("orders")
        .where("user", "==", id)
        .limit(10)
        .get();

      res.status(200).json({
        success: true,
        orders: orders.docs.map((order) => ({
          ...order.data(),
          id: order.id,
        })),
      });
    } catch (e) {
      console.log("Error getting previous orders>>", e);
      res.status(500).json({
        success: false,
        message: "Could not get previous orders",
        error: e,
      });
    }
  }
);

exports.checkForDelivery = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const delivery_postcode: string = req.body.postCode;
      const productId: string = req.body.productId;

      const config = (await firestoredb().collection("config").get()).docs[0];

      const product = (
        await firestoredb().collection("products").doc(productId).get()
      ).data();

      if (!product) {
        res.status(400).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      if (!product!.available) {
        res.status(400).json({
          success: false,
          message: "Product is sold out",
        });
        return;
      }

      if (product!.sold) {
        res.status(400).json({
          success: false,
          message: "Product is sold out",
        });
        return;
      }

      const seller_id = product!.store;

      const address = (
        await firestoredb()
          .collection("addresses")
          .where("user", "==", seller_id)
          .get()
      ).docs[0];

      const pickup_postcode = address.data().pincode;

      const response = await axios.get(SHIPROCKET_SERVICEABILITY, {
        params: {
          pickup_postcode,
          delivery_postcode,
          cod: 0,
          weight: 1,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.data().shiprocket_access_token}`,
        },
      });

      if (response.status !== 200) {
        res.status(500).json({
          success: false,
          message: "Something went wrong",
          error: response.data,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (e) {
      console.log("Getting delivery status failed>>", e);
      res.status(500).json({
        success: false,
        message: "Could not get delivery status",
        error: e,
      });
    }
  }
);
