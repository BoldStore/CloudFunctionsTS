class User {
  user: string;
  preference: string;
  insta_username?: string;

  constructor(user: string, preference: string, insta_username?: string) {
    this.user = user;
    this.preference = preference;
    this.insta_username = insta_username;

    return {
      user: this.user,
      preference: this.preference,
      insta_username: this.insta_username,
    };
  }
}
