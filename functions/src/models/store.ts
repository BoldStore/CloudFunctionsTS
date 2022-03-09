class Store {
  name: string;
  username: string;
  user: string;
  lastRefreshed: Date;
  followers?: string;
  following?: string;
  imgUrl?: string;

  constructor(
    name: string,
    username: string,
    user: string,
    lastRefreshed: Date,
    followers?: string,
    following?: string,
    imgUrl?: string
  ) {
    this.name = name;
    this.username = username;
    this.user = user;
    this.followers = followers;
    this.following = following;
    this.lastRefreshed = lastRefreshed;
    this.imgUrl = imgUrl;

    return {
      name: this.name,
      username: this.username,
      user: this.user,
      followers: this.followers,
      following: this.following,
      lastRefreshed: this.lastRefreshed,
      imgUrl: this.imgUrl,
    };
  }
}
