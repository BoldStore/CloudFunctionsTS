/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore } from "firebase-admin";
import { addProduct } from "./product";

export const addProducts: (
  storeId: string,
  posts: Array<any>,
  access_token?: string
) => Promise<void> = async (storeId, posts, access_token) => {
  const collection = firestore().collection("products");
  let token: string = access_token ?? "";
  const products: Array<any> = [];

  if (!access_token) {
    const store = await firestore().collection("stores").doc(storeId).get();
    token = store.data()?.access_token;
  }
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const productData = await addProduct(storeId, post, token);

    if (productData.product) {
      products.push(productData.product);
    }
  }

  //   For faster write times
  await Promise.all(products.map((data) => collection.add(data)));

  return;
};
