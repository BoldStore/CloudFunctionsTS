class User {
  name?: string;
  email: string;
  phone?: string;
  imgUrl?: string;
  insta_username?: string;
  deletedOn?: Date;

  constructor(
    email: string,
    name?: string,
    phone?: string,
    imgUrl?: string,
    insta_username?: string,
    deletedOn?: Date
  ) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.imgUrl = imgUrl;
    this.insta_username = insta_username;
    this.deletedOn = deletedOn;

    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      imgUrl: this.imgUrl,
      insta_username: this.insta_username,
      deletedOn: this.deletedOn,
    };
  }
}

type UserType = {
  name?: string;
  email: string;
  phone?: string;
  imgUrl?: string;
  insta_username?: string;
  deletedOn?: Date;
};
