/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore } from "firebase-admin";
import { listOfClothes } from "../data/listOfClothes";
import { S3_BUCKET_NAME } from "../secrets";
import { handler } from "./s3/file_upload_s3";

interface PostData {
  price: string;
  name: string;
  sold: boolean;
}

export const analysePost: (captionString: string) => PostData = (
  captionString: string
) => {
  const caption = captionString.toLowerCase();
  let price = "";
  let sold = false;
  let name = "";

  price = getPrice(caption);
  sold = checkSold(caption);
  name = getName(caption);

  return {
    price,
    sold,
    name,
  };
};

export const addProduct: (storeId: string, post: any) => Promise<void> = async (
  storeId,
  post
) => {
  try {
    let file_name = "";
    let post_url = "";
    // TODO: Do not upload if not product,
    // That is, if the caption does not contain
    // price or sold

    // For now, testing purposes, I've commented it out

    // if (!post.caption) {
    //   return;
    // }
    const prod_data = analysePost(post.caption ?? "");

    // if (
    //   !prod_data.price &&
    //   !(post.caption as string).toLowerCase().includes("sold")
    // ) {
    //   return;
    // }

    // Check if the product is already in the database
    const productInDb = await firestore()
      .collection("products")
      .doc(post.id)
      .get();

    if (productInDb.data()?.sold) {
      return;
    }

    if (productInDb.data()?.price == prod_data.price) {
      return;
    }

    if (!productInDb.exists) {
      file_name = (
        post.id + new Date().getUTCMilliseconds().toString()
      ).toString();

      post_url = await handler({
        fileUrl: post.media_url,
        fileName: file_name,
        bucket: S3_BUCKET_NAME,
      });
    } else {
      file_name = productInDb.data()?.file_name;
      post_url = productInDb.data()?.imgUrl;
    }

    const product = {
      name: prod_data.name,
      size: "",
      sold: prod_data.sold,
      postedOn: post.timestamp,
      amount: prod_data.price,
      likes: "",
      comments: "",
      store: storeId,
      color: "",
      soldOn: null,
      file_name: file_name,
      imgUrl: post_url,
      caption: post?.caption ?? null,
      permalink: post.permalink,
      id: post.id,
    };

    //   Add to firebase
    await firestore()
      .collection("products")
      .doc(post.id)
      .set(product, { merge: true });

    return;
  } catch (e) {
    console.log("Error in adding post", e);
    return;
  }
};

const getName = (caption: string) => {
  let name = "";
  listOfClothes.forEach((item: string) => {
    if (caption.includes(item)) {
      name = item;
    }
  });
  return name;
};

const checkSold = (caption: string) => {
  let sold = false;
  if (caption.includes("sold")) {
    sold = true;
  }
  return sold;
};

const getPrice = (caption: string) => {
  let price = "";
  if (
    (caption.includes("price") ||
      caption.includes("inr") ||
      caption.includes("₹")) &&
    !caption.includes("sold")
  ) {
    // list is to get the number right after the
    // item of list because sometimes price may
    // not be the first number in the caption,
    const list = ["price", "₹", "inr"];
    let i = -1;
    for (const str of list) {
      i = caption.indexOf(str);
      if (i != -1) {
        break;
      }
    }

    // Slicing from the position of the list
    // and no clue what match does (stackoverflow helped)
    const matches = caption.slice(i).match(/(\d+)/);
    if (matches) {
      price = matches[0];
    }
  }
  return price;
};
