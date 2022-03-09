class User {
  name: string;
  email: string;
  password: string;
  loginType: string;
  phone?: string;
  imgUrl?: string;
  username?: string;

  constructor(
    name: string,
    email: string,
    password: string,
    loginType: string,
    phone?: string,
    imgUrl?: string,
    username?: string
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.loginType = loginType;
    this.imgUrl = imgUrl;
    this.username = username;

    return {
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      loginType: this.loginType,
      imgUrl: this.imgUrl,
      username: this.username,
    };
  }
}
