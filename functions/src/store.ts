import { https, Request, Response } from "firebase-functions/v1";
import { getAccessToken } from "./helper/get_access_token";
import { firestore as firestoredb } from "firebase-admin";
import { getStoreData, getStoreMedia } from "./helper/get_store_data";

exports.getInstagramData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const code: string = req.query.code!.toString();
    const userId: string = req.query.userId!.toString();

    const token_response = await getAccessToken(code);
    const access_token = token_response.access_token;
    const insta_user_id = token_response.user_id;

    const store = await getStoreData(insta_user_id, access_token, userId);

    if (!store) {
      res.status(400).json({
        success: false,
        message: "There was an error",
      });
    }

    const db_store = await firestoredb().collection("stores").add(store);
    const storeId = db_store.id;

    const success: boolean = await getStoreMedia(
      insta_user_id,
      access_token,
      storeId
    );
    if (!success) {
      res.status(400).json({
        success: false,
        message: "There was an error getting the media",
      });
    }

    res.status(200).json({
      success: true,
    });
  }
);
