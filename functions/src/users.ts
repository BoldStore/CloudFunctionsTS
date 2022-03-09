import { firestore } from "firebase-functions/v1";

exports.helloAuth = (event: any) => {
  try {
    console.log(`Function triggered by change to user: ${event.uid}`);
    console.log(`Created at: ${event.metadata.createdAt}`);

    if (event.email) {
      console.log(`Email: ${event.email}`);
    }
  } catch (err) {
    console.error(err);
  }
};

exports.userDeleted = firestore
  .document("users/{userId}")
  .onDelete(async (snapshot, context) => {
    // TODO: Implement delete
  });
