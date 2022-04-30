import { auth } from "firebase-admin";
import { Request, Response } from "firebase-functions/v1";

export const checkAuth = async (req: Request, res: Response) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Auth Token not provided",
    });
    return;
  }

  try {
    const userId: string = (await auth().verifyIdToken(token)).uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    } else {
      return userId;
    }
  } catch (e) {
    console.log(e);
    res.status(401).json({
      success: false,
      message: "There was an error: " + e,
    });
    return;
  }
};
