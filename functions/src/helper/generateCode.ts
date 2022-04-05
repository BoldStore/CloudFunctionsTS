import { firestore } from "firebase-admin";

export const generateCode = async () => {
  // Generate invite token (6 digit random number)
  const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Check if already exists
  const tokenInDb = await firestore()
    .collection("codes")
    .where("code", "==", inviteCode)
    .get();

  if (tokenInDb.docs.length > 0) {
    generateCode();
  }
  return inviteCode;
};
