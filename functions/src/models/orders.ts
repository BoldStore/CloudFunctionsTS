class Order {
  product: string;
  amount: string;
  createdAt: Date;
  confirmed: boolean;
  orderId: string;
  paymentId: string;
  user: string;
  address: string;
  currency: string;

  constructor(
    product: string,
    amount: string,
    createdAt: Date,
    confirmed: boolean,
    orderId: string,
    paymentId: string,
    user: string,
    address: string,
    currency: string
  ) {
    this.product = product;
    this.amount = amount;
    this.createdAt = createdAt;
    this.confirmed = confirmed;
    this.orderId = orderId;
    this.paymentId = paymentId;
    this.user = user;
    this.address = address;
    this.currency = currency;

    return {
      product: this.product,
      amount: this.amount,
      createdAt: this.createdAt,
      confirmed: this.confirmed,
      orderId: this.orderId,
      paymentId: this.paymentId,
      user: this.user,
      address: this.address,
      currency: this.currency,
    };
  }
}
