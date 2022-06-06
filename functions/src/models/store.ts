/* eslint-disable require-jsdoc */
export class Store {
  full_name: string;
  username: string;
  id: string;
  lastRefreshed: Date;
  followers?: string;
  following?: string;
  profile_pic?: string;
  instagram_id?: string;
  bio?: string;
  isComplete: boolean;
  phone: string | null | undefined;
  upi_id: string | null | undefined;

  constructor(
    full_name: string,
    username: string,
    id: string,
    lastRefreshed: Date,
    followers?: string,
    following?: string,
    profile_pic?: string,
    instagram_id?: string,
    bio?: string,
    isComplete = false,
    phone?: string | null | undefined,
    upi_id?: string | null | undefined
  ) {
    this.full_name = full_name;
    this.username = username;
    this.id = id;
    this.followers = followers;
    this.following = following;
    this.lastRefreshed = lastRefreshed;
    this.profile_pic = profile_pic;
    this.instagram_id = instagram_id;
    this.bio = bio;
    this.isComplete = isComplete;
    this.phone = phone;
    this.upi_id = upi_id;

    return {
      full_name: this.full_name,
      username: this.username,
      id: this.id,
      followers: this.followers,
      following: this.following,
      lastRefreshed: this.lastRefreshed,
      profile_pic: this.profile_pic,
      instagram_id: this.instagram_id,
      bio: this.bio,
      isComplete: this.isComplete,
      phone: this.phone,
      upi_id: this.upi_id,
    };
  }
}

export interface StoreType {
  full_name: string | null | undefined;
  username: string;
  id: string;
  lastRefreshed: Date;
  followers: string | number | null | undefined;
  following: string | number | null | undefined;
  profile_pic: string | null | undefined;
  instagram_id: string;
  bio: string | null | undefined;
  access_token: string;
  user_id: string;
  expires_in: string | number;
  isComplete: boolean | null;
  phone?: string | null | undefined;
  upi_id?: string | null | undefined;
}
