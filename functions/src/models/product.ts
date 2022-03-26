class Product {
  name: string;
  size: string;
  sold: string;
  postedOn: Date;
  amount: string;
  likes: string;
  comments: string;
  store: string;
  color?: string;
  soldOn?: Date;
  filename?: string;
  imgUrl?: string;

  constructor(
    name: string,
    size: string,
    sold: string,
    postedOn: Date,
    amount: string,
    likes: string,
    comments: string,
    store: string,
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
    this.color = color;
    this.postedOn = postedOn;
    this.soldOn = soldOn;
    this.filename = filename;
    this.imgUrl = imgUrl;

    return {
      name: name,
      size: size,
      sold: sold,
      amount: amount,
      likes: likes,
      comments: comments,
      store: store,
      color: color,
      postedOn: postedOn,
      soldOn: soldOn,
      filename: filename,
      imgUrl: imgUrl,
    };
  }
}
