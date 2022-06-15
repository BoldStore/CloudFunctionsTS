import { auth, firestore } from "firebase-admin";

export const deleteStore: (storeId: string) => Promise<void> = async (
  storeId
) => {
  // Delete from stores collection
  await firestore().collection("stores").doc(storeId).delete();

  //   Delete payment details
  await firestore().collection("paymentDetails").doc(storeId).delete();

  // Delete Addresses
  const addresses = await firestore()
    .collection("addresses")
    .where("user", "==", storeId)
    .get();

  await deleteByBatching(addresses);

  // Delete Products
  const products = await firestore()
    .collection("products")
    .where("store", "==", storeId)
    .get();

  await deleteByBatching(products);

  //   Delete Authentication
  await auth().deleteUser(storeId);

  return;
};

const deleteByBatching = async (
  snapshot: firestore.QuerySnapshot<firestore.DocumentData>
) => {
  try {
    const batch = firestore().batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (e) {
    console.log("Error in deleting documents", e);
  }
};
