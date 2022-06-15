/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { firestore } from "firebase-admin";
import { onRequest, Request } from "firebase-functions/v1/https";
import { MEILI_API_KEY, MEILI_API_URL } from "../secrets";

exports.importStoresToMeili = onRequest(async (req: Request, res) => {
  try {
    const storesCollection = await firestore().collection("stores").get();

    const stores = storesCollection.docs.map((doc) => {
      const store = doc.data();
      return {
        id: doc.id,
        name: store.full_name,
        username: store.username,
        profile_pic: store.profile_pic,
        city: store.city,
        isCompleted: store.isCompleted,
      };
    });

    await axios.post(`${MEILI_API_URL}/indexes/stores/documents`, stores, {
      headers: { "X-Meili-API-Key": MEILI_API_KEY },
    });
    await axios.post(
      `${MEILI_API_URL}/indexes/stores/settings`,
      {
        searchableAttributes: ["name", "username", "city"],
        filterableAttributes: ["isCompleted"],
      },
      {
        headers: { "X-Meili-API-Key": MEILI_API_KEY },
      }
    );
    res.status(200).send({
      success: true,
    });
  } catch (e) {
    console.error("Failed to import stores to Meili", (e as any).response.data);
    res.status(500).json({ error: (e as any)?.response?.data ?? e });
  }
});

export const addOrUpdateStore: (
  store: FirebaseFirestore.DocumentData,
  storeId: string
) => Promise<{ success: boolean; error: any }> = async (store, storeId) => {
  try {
    await axios.post(
      `${MEILI_API_URL}/indexes/stores/documents`,
      {
        id: storeId,
        name: store.full_name,
        username: store.username,
        profile_pic: store.profile_pic,
        city: store.city,
      },
      {
        headers: { "X-Meili-API-Key": MEILI_API_KEY },
      }
    );
    return {
      success: true,
      error: null,
    };
  } catch (e) {
    console.log("Error in updating Store on meili");
    return {
      success: false,
      error: (e as any)?.response?.data,
    };
  }
};

export const deleteStore: (
  storeId: string
) => Promise<{ success: boolean; error: any }> = async (storeId) => {
  try {
    await axios.delete(`${MEILI_API_URL}/indexes/users/documents/${storeId}`, {
      headers: { "X-Meili-API-Key": MEILI_API_KEY },
    });
    return {
      success: true,
      error: null,
    };
  } catch (e) {
    console.error("Failed to delete Meili user", (e as any)?.response?.data);
    return {
      success: false,
      error: (e as any)?.response?.data,
    };
  }
};

exports.importProductsToMeili = onRequest(async (req: Request, res) => {
  try {
    const productsCollection = await firestore().collection("products").get();

    const products = productsCollection.docs.map((doc) => {
      const product = doc.data();
      return {
        id: doc.id,
        name: product.name,
        caption: product.caption,
        imgUrl: product.imgUrl,
        permalink: product.permalink,
        store: product.store,
        size: product.size,
      };
    });

    await axios.post(`${MEILI_API_URL}/indexes/products/documents`, products, {
      headers: { "X-Meili-API-Key": MEILI_API_KEY },
    });
    await axios.post(
      `${MEILI_API_URL}/indexes/products/settings`,
      {
        filterableAttributes: ["store", "size", "name"],
        searchableAttributes: ["name", "caption"],
      },
      {
        headers: { "X-Meili-API-Key": MEILI_API_KEY },
      }
    );
    res.status(200).send({
      success: true,
    });
  } catch (e) {
    console.error(
      "Failed to import products to Meili",
      (e as any)?.response?.data
    );
    res.status(500).json({ error: (e as any)?.response?.data ?? e });
  }
});

export const addOrUpdateProduct: (
  product: FirebaseFirestore.DocumentData,
  productId: string
) => Promise<{ success: boolean; error: any }> = async (product, productId) => {
  try {
    await axios.post(
      `${MEILI_API_URL}/indexes/products/documents`,
      {
        id: productId,
        name: product.name,
        caption: product.caption,
        imgUrl: product.imgUrl,
        permalink: product.permalink,
        store: product.store,
        size: product.size,
      },
      {
        headers: { "X-Meili-API-Key": MEILI_API_KEY },
      }
    );
    return {
      success: true,
      error: null,
    };
  } catch (e) {
    console.log("Error in updating Store on meili");
    return {
      success: false,
      error: (e as any)?.response?.data ?? e,
    };
  }
};

export const deleteProduct: (
  productId: string
) => Promise<{ success: boolean; error: any }> = async (productId) => {
  try {
    await axios.delete(
      `${MEILI_API_URL}/indexes/users/documents/${productId}`,
      {
        headers: { "X-Meili-API-Key": MEILI_API_KEY },
      }
    );
    return {
      success: true,
      error: null,
    };
  } catch (e) {
    console.error("Failed to delete Meili user", (e as any).response.data);
    return {
      success: false,
      error: (e as any).response.data,
    };
  }
};
