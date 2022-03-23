class Store {
  name: string;
  username: string;
  user: string;
  lastRefreshed: Date;
  followers?: string;
  following?: string;
  imgUrl?: string;
  instagram_id?: string;

  constructor(
    name: string,
    username: string,
    user: string,
    lastRefreshed: Date,
    followers?: string,
    following?: string,
    imgUrl?: string,
    instagram_id?: string
  ) {
    this.name = name;
    this.username = username;
    this.user = user;
    this.followers = followers;
    this.following = following;
    this.lastRefreshed = lastRefreshed;
    this.imgUrl = imgUrl;
    this.instagram_id = instagram_id;

    return {
      name: this.name,
      username: this.username,
      user: this.user,
      followers: this.followers,
      following: this.following,
      lastRefreshed: this.lastRefreshed,
      imgUrl: this.imgUrl,
      instagram_id: this.instagram_id,
    };
  }
}
