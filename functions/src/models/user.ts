class User {
  name: string;
  email: string;
  password: string;
  loginType: string;
  phone?: string;
  imgUrl?: string;
  insta_username?: string;
  deletedOn?: Date;

  constructor(
    name: string,
    email: string,
    password: string,
    loginType: string,
    phone?: string,
    imgUrl?: string,
    insta_username?: string,
    deletedOn?: Date
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.loginType = loginType;
    this.imgUrl = imgUrl;
    this.insta_username = insta_username;
    this.deletedOn = deletedOn;

    return {
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      loginType: this.loginType,
      imgUrl: this.imgUrl,
      insta_username: this.insta_username,
      deletedOn: this.deletedOn,
    };
  }
}
