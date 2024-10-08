/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore } from "firebase-admin";
import { listOfClothes } from "../../data/listOfClothes";
import { S3_BUCKET_NAME } from "../../secrets";
import { getCaraouselMedia } from "../insta/get_insta_data";
import { handler } from "../s3/file_upload_s3";

export interface PostData {
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

export const addProduct: (
  storeId: string,
  post: any,
  access_token?: string,
  newPost?: boolean
) => Promise<any> = async (storeId, post, access_token, newPost = false) => {
  try {
    let file_name = "";
    let post_url = "";
    let images: Array<{ id: string; file_name: string; imgUrl: string }> = [];
    let token = access_token ?? "";

    const config = (await firestore().collection("config").get()).docs[0];

    if (!post.caption) {
      return;
    }

    // Do not save if video
    if (post.media_type === "VIDEO") {
      return;
    }

    const prod_data = analysePost(post.caption ?? "");

    if (config?.data()?.env == "prod") {
      if (
        !prod_data.price &&
        !(post.caption as string).toLowerCase().includes("sold")
      ) {
        return;
      }
    }

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
      if (post.media_type === "CAROUSEL_ALBUM") {
        if (!token) {
          const store = await firestore()
            .collection("stores")
            .doc(storeId)
            .get();
          token = store.data()?.access_token;
        }
        // Handle caraousel
        const caraousel = await handleCaraousel(post, token);
        if (caraousel.error) {
          return;
        }
        images.push(...caraousel.images);
      } else {
        file_name = post.id.toString();

        post_url = await handler({
          fileUrl: post.media_url,
          fileName: file_name,
          bucket: S3_BUCKET_NAME,
        });
      }
    } else {
      images = productInDb.data()?.images ?? [];
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
      type: post.media_type,
      store_username: post.username,
      available: true,
      images,
    };

    //   Add to firebase
    if (newPost) {
      await firestore()
        .collection("products")
        .doc(post.id)
        .set(product, { merge: true });
    }

    return {
      product,
      error: null,
    };
  } catch (e) {
    console.log("Error in adding post", e);
    return {
      product: null,
      error: e,
    };
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

const handleCaraousel: (
  post: any,
  access_token: string
) => Promise<{
  images: Array<{ id: string; file_name: string; imgUrl: string }>;
  error: any;
}> = async (post, access_token) => {
  let file_name = "";
  const images: any = [];
  let error = null;

  const data = await getCaraouselMedia(post.id, access_token);
  if (data.error) {
    error = data.error;
  }
  for (let i = 0; i < data?.data?.data?.length; i++) {
    const media = data?.data?.data[i];

    if (media.media_type === "VIDEO") {
      continue;
    }

    // Upload to S3
    file_name = media.id.toString();

    const media_s3 = await handler({
      fileUrl: media.media_url,
      fileName: file_name,
      bucket: S3_BUCKET_NAME,
    });

    images.push({
      id: media.id,
      file_name: file_name,
      imgUrl: media_s3,
    });
  }

  return {
    images,
    error,
  };
};
