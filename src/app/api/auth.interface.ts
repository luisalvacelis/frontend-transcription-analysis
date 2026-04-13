export interface AuthLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthMe {
  id: string;
  username: string;
  register_date: string;
  updated_date: string;
}
