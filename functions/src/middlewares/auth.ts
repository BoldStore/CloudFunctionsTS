// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.

import { NextFunction, Request, Response } from "express";
import { auth } from "firebase-admin";
import ExpressError = require("../utils/ExpressError");

// when decoded successfully, the ID Token content will be added as `req.user`.
export const validateFirebaseIdToken: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    next(new ExpressError("Auth Token not provided", 401));
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    next(new ExpressError("Auth Token not valid", 401));
    return;
  }

  try {
    const decodedIdToken = await auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (e) {
    next(new ExpressError("There was an error", 401, e));
    return;
  }
};
