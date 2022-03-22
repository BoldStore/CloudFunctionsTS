import { https, Request, Response } from "firebase-functions/v1";
import { getAccessToken } from "./helper/get_access_token";

exports.getInstaCode = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const code: string = req.query.code!.toString();
    const userId: string = req.query.userId!.toString();

    const token_response = await getAccessToken(code);
    const access_token = token_response.access_token;
    const insta_user_id = token_response.user_id;

    res.status(200).json({
      success: true,
    });
  }
);
