/* eslint-disable require-jsdoc */
export class Address {
  id: string | null;
  address: string;
  name: string;
  addressL1: string;
  addressL2: string;
  city: string;
  state: string;
  pincode: number;
  user: string;
  phone: string;
  notes?: string;

  constructor(
    id: string | null,
    address: string,
    name: string,
    addressL1: string,
    addressL2: string,
    city: string,
    state: string,
    pincode: number,
    user: string,
    phone: string,
    notes?: string
  ) {
    this.id = id;
    this.address = address;
    this.name = name;
    this.addressL1 = addressL1;
    this.addressL2 = addressL2;
    this.city = city;
    this.state = state;
    this.pincode = pincode;
    this.user = user;
    this.phone = phone;
    this.notes = notes;

    return {
      id: this.id,
      address: this.address,
      name: this.name,
      addressL1: this.addressL1,
      addressL2: this.addressL2,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      user: this.user,
      phone: this.phone,
      notes: this.notes,
    };
  }
}

export interface AddressType {
  id: string | null;
  address: string;
  name: string;
  addressL1: string;
  addressL2: string;
  city: string;
  state: string;
  pincode: number;
  user: string;
  phone: string;
  notes?: string;
}
