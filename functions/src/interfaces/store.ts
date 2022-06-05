export interface Store {
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
}
