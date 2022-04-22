/* eslint-disable require-jsdoc */
class Address {
  address: string;
  title: string;
  addressL1: string;
  addressL2: string;
  city: string;
  state: string;
  pincode: number;
  user: string;
  notes?: string;

  constructor(
    address: string,
    title: string,
    addressL1: string,
    addressL2: string,
    city: string,
    state: string,
    pincode: number,
    user: string,
    notes?: string
  ) {
    this.address = address;
    this.title = title;
    this.addressL1 = addressL1;
    this.addressL2 = addressL2;
    this.city = city;
    this.state = state;
    this.pincode = pincode;
    this.user = user;
    this.notes = notes;

    return {
      address: this.address,
      title: this.title,
      addressL1: this.addressL1,
      addressL2: this.addressL2,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      user: this.user,
      notes: this.notes,
    };
  }
}

type AddressType = {
  address: string;
  title: string;
  addressL1: string;
  addressL2: string;
  city: string;
  state: string;
  pincode: number;
  user: string;
  notes?: string;
};
