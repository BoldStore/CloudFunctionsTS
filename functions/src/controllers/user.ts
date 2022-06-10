/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextFunction, Request, Response } from "express";
import { auth, firestore } from "firebase-admin";
import { getInstaData } from "../helper/insta/get_insta_data";
import { deleteObject, handler } from "../helper/s3/file_upload_s3";
import { S3_BUCKET_NAME } from "../secrets";
import ExpressError = require("../utils/ExpressError");

export const createUser: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authData = req.user;
    const id = authData.uid;
    const email = authData.email;

    const user = await firestore().collection("users").doc(id).get();
    const store = await firestore().collection("stores").doc(id).get();

    if (user?.exists) {
      next(new ExpressError("User already exists", 400));
      return;
    }

    if (store?.exists) {
      next(new ExpressError("Store already exists", 400));
      return;
    }

    await firestore().collection("users").doc(id).set({
      email,
    });

    await auth().setCustomUserClaims(id, {
      isStore: false,
    });

    res.status(201).json({
      success: true,
      user: {
        email: email,
      },
    });
  } catch (e) {
    console.log("Error in adding user", e);
    next(new ExpressError("Error in creating user", 500, e));
  }
};

export const addInstaUsername: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const insta_username = req.body.insta_username?.toString();

    if (!insta_username) {
      next(new ExpressError("Instagram username is required", 400));
      return;
    }

    // Check if already exists
    const userDb = (
      await firestore()
        .collection("users")
        .where("insta_username", "==", insta_username)
        .limit(1)
        .get()
    ).docs;

    if (userDb.length > 0) {
      if (userDb[0].id !== id) {
        next(new ExpressError("Instagram username already exists", 400));
        return;
      }
    }

    const data = await getInstaData(insta_username);

    if (!data) {
      next(new ExpressError("Invalid username", 400));
      return;
    }

    await deleteObject({
      bucket: S3_BUCKET_NAME,
      fileName: `${id}-profile-pic.jpg`,
    });

    let profilePic = "";
    if (data.profile_pic) {
      // Upload to s3
      profilePic = await handler({
        fileUrl: data.profile_pic!.toString(),
        fileName: `${id}-profile-pic.jpg`,
        bucket: S3_BUCKET_NAME,
      });
    }

    const user = await firestore().collection("users").doc(id).set(
      {
        insta_username: insta_username,
        name: data.full_name,
        imgUrl: profilePic,
      },
      { merge: true }
    );

    await auth().updateUser(id, {
      photoURL: profilePic,
      displayName: data.full_name,
    });

    res.status(200).json({
      success: true,
      user: {
        insta_username: insta_username,
        name: data.full_name,
        imgUrl: profilePic,
      },
      userResult: user,
    });
  } catch (e) {
    console.log("Error in adding insta username", e);
    next(new ExpressError("Error in adding insta username", 500, e));
  }
};

export const getPersonalDetails: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
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
    });
  } catch (e) {
    console.log("Error in getting personal details", e);
    next(new ExpressError("Error in getting personal details", 500, e));
  }
};

export const updateUser: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;
    let user;
    let profilePic = "";

    const name = req.body.name;
    const birthday = req.body.birthday;
    const sizePreference = req.body.sizePreference;
    const phone = req.body.phone;
    const insta_username = req.body.insta_username;

    if (insta_username) {
      const userDb = (
        await firestore()
          .collection("users")
          .where("insta_username", "!=", null)
          .where("insta_username", "==", insta_username)
          .limit(1)
          .get()
      ).docs;

      if (userDb.length > 0) {
        if (userDb[0].id !== id) {
          next(new ExpressError("Instagram username already exists", 400));
          return;
        }
      }

      const data = await getInstaData(insta_username);

      if (!data) {
        next(new ExpressError("Invalid username", 400));
        return;
      }
      await deleteObject({
        bucket: S3_BUCKET_NAME,
        fileName: `${id}-profile-pic.jpg`,
      });

      if (data.profile_pic) {
        // Upload to s3
        profilePic = await handler({
          fileUrl: data.profile_pic!.toString(),
          fileName: `${id}-profile-pic.jpg`,
          bucket: S3_BUCKET_NAME,
        });
      }
    }

    if (!profilePic) {
      user = await firestore()
        .collection("users")
        .doc(id)
        .update({
          name: name ?? "",
          birthday: birthday ?? null,
          sizePreference: sizePreference ?? null,
          phone: phone ?? null,
          insta_username: insta_username ?? null,
        });

      await auth().updateUser(id, {
        displayName: name,
        phoneNumber: phone,
      });
    } else {
      user = await firestore()
        .collection("users")
        .doc(id)
        .update({
          name: name ? name : "",
          birthday: birthday ? birthday : null,
          sizePreference: sizePreference ? sizePreference : null,
          phone: phone ? phone : null,
          insta_username: insta_username ? insta_username : null,
          imgUrl: profilePic,
        });

      if (phone) {
        await auth().updateUser(id, {
          displayName: name ?? "",
          phoneNumber: phone,
          photoURL: profilePic,
        });
      } else {
        await auth().updateUser(id, {
          displayName: name ?? "",
          photoURL: profilePic,
        });
      }
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (e) {
    console.log("Error in updating user", e);
    next(new ExpressError("Could not update user", 500, e));
  }
};

// TODO: Delete users cron
export const deleteUser: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const user = await firestore().collection("users").doc(id).update({
      deletedOn: new Date(),
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (e) {
    console.log("Error in deleting user", e);
    next(new ExpressError("Could not delete user", 500, e));
  }
};
