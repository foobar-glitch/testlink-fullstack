import { TimeStamp } from './tablemetadata';

export interface Authority {
  authorityId: string;
  authority: string;
  timeStamp: TimeStamp;
}

export interface Authentication {
  userId: string;
  username: string;
  email: string;
  authorities: Authority[];
  timeStamp: TimeStamp[];
}

export interface UserSummary{
  userId: string;
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
