import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { getInstaData } from "../helper/insta/get_insta_data";
import ExpressError = require("../utils/ExpressError");

// Check if server is up
export const respond = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({
    success: true,
    message: "Hello World",
  });
};

// Check if user is logged in
export const checkLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const user = (await firestore().collection("users").doc(id).get()).data();

    res.status(200).json({
      success: true,
      user,
      id,
      message: "User logged in",
    });
  } catch (e) {
    next(new ExpressError("Error in checking login", 500, e));
  }
};

export const getInsta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    if (!data) {
      next(new ExpressError("No insta data found", 400));
    }

    res.status(200).json({
      success: true,
      insta_username,
      data,
    });
  } catch (e) {
    next(new ExpressError("Error in checking login", 500, e));
  }
};
