export const INSTAGRAM_API_URL = "https://api.instagram.com";
export const INSTAGRAM_GRAPH_API_URL = "https://graph.instagram.com/v13.0";
export const INSTAGRAM_BASE_URL = "https://instagram.com";
export const INSTAGRAM_LOGIN = INSTAGRAM_BASE_URL + "/accounts/login/ajax/";

export const INSTAGRAM_ACCESS_TOKEN = INSTAGRAM_API_URL + "/oauth/access_token";

export const BASIC_FIELDS = "id,username";
export const MEDIA_FIELDS =
  "caption,id,media_type,media_url,permalink,timestamp,username,children";
export const CHILDREN_FIELDS =
  "id,media_url,username,timestamp,media_type,permalink";

export const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1";
export const SHIPROCKET_SERVICEABILITY =
  SHIPROCKET_API_URL + "/external/courier/serviceability/";
export const SHIPROCKET_LOGIN = SHIPROCKET_API_URL + "/external/auth/login";
export const NEW_PICKUP =
  SHIPROCKET_API_URL + "/external/settings/company/addpickup";
export const SHIPROCKET_CHANNELS = SHIPROCKET_API_URL + "/external/channels";
export const CREATE_SHIPMENT =
  SHIPROCKET_API_URL + "/external/shipments/create/forward-shipment";

export const SHIPROCKET_ADDRESSES =
  SHIPROCKET_API_URL + "/external/settings/company/pickup";
