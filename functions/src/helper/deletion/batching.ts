import { firestore } from "firebase-admin";

export const deleteByBatching: (
  snapshot: firestore.QuerySnapshot<firestore.DocumentData>
) => Promise<void> = async (snapshot) => {
  try {
    const batch = firestore().batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (e) {
    console.log("Error in deleting documents", e);
  }

  return;
};
