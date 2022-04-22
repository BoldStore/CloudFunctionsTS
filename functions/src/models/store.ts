/* eslint-disable require-jsdoc */
class Store {
  full_name: string;
  username: string;
  id: string;
  lastRefreshed: Date;
  followers?: string;
  following?: string;
  profile_pic?: string;
  instagram_id?: string;
  bio?: string;

  constructor(
    full_name: string,
    username: string,
    id: string,
    lastRefreshed: Date,
    followers?: string,
    following?: string,
    profile_pic?: string,
    instagram_id?: string,
    bio?: string
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
    };
  }
}
