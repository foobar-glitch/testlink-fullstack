export interface Authentication {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface UserSummary{
  userId: number;
  username: string
}

export interface AuthResponse {
  message: string;
  user: Authentication;
}
export interface LoginRequest {
  username: string;
  password: string;
}
