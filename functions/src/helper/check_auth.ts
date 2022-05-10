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
    const user = await auth().verifyIdToken(token);

    const userId = user.uid;
    const email = user.email;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    } else {
      return {
        userId,
        email,
      };
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
