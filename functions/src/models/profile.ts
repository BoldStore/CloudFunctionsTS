class Profile {
  name: string;
  email: string;
  password: string;
  loginType: string;
  phone?: string;
  imgUrl?: string;
  age?: string;
  deletedOn?: Date;
  customer?: string;

  constructor(
    name: string,
    email: string,
    password: string,
    loginType: string,
    phone?: string,
    imgUrl?: string,
    age?: string,
    deletedOn?: Date,
    customer?: string
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.loginType = loginType;
    this.imgUrl = imgUrl;
    this.age = age;
    this.deletedOn = deletedOn;
    this.customer = customer;

    return {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      phone: this.phone,
      loginType: this.loginType,
      imgUrl: this.imgUrl,
      deletedOn: this.deletedOn,
      customer: this.customer,
    };
  }
}
