/* eslint-disable require-jsdoc */
class Product {
  name: string;
  size: string;
  sold: boolean;
  postedOn: Date;
  amount: string;
  likes: string;
  comments: string;
  store: string;
  seller: string;
  color?: string;
  soldOn?: Date;
  filename?: string;
  imgUrl?: string;

  constructor(
    name: string,
    size: string,
    sold: boolean,
    postedOn: Date,
    amount: string,
    likes: string,
    comments: string,
    store: string,
    seller: string,
    color?: string,
    soldOn?: Date,
    filename?: string,
    imgUrl?: string
  ) {
    this.name = name;
    this.size = size;
    this.sold = sold;
    this.amount = amount;
    this.likes = likes;
    this.comments = comments;
    this.store = store;
    this.seller = seller;
    this.color = color;
    this.postedOn = postedOn;
    this.soldOn = soldOn;
    this.filename = filename;
    this.imgUrl = imgUrl;

    return {
      name: this.name,
      size: this.size,
      sold: this.sold,
      amount: this.amount,
      likes: this.likes,
      comments: this.comments,
      store: this.store,
      seller: this.seller,
      color: this.color,
      postedOn: this.postedOn,
      soldOn: this.soldOn,
      filename: this.filename,
      imgUrl: this.imgUrl,
    };
  }
}

type ProductType = {
  name: string;
  size: string;
  sold: boolean;
  postedOn: Date;
  amount: string;
  likes: string;
  comments: string;
  store: string;
  color?: string;
  soldOn?: Date;
  filename?: string;
  imgUrl?: string;
  seller: string;
};
