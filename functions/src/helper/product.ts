import { listOfClothes } from "../data/listOfClothes";

export const analysePost = (captionString: string) => {
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
