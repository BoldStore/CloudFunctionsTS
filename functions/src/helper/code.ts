import { firestore } from "firebase-admin";

export const generateCode: () => Promise<string> = async () => {
  // Generate invite token (6 digit random number)
  const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

  const exists: boolean = await checkCodeValidation(inviteCode);

  if (exists) {
    generateCode();
  }
  return inviteCode;
};

export const checkCodeValidation: (code: string) => Promise<boolean> = async (
  code: string
) => {
  let exists = false;

  // Check if already exists
  const tokenInDb = await firestore()
    .collection("codes")
    .where("code", "==", code)
    .get();

  if (tokenInDb.docs.length > 0) {
    exists = true;
  }

  return exists;
};
