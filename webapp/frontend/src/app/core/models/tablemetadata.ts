import { UserSummary } from './authentication';

export interface TimeStamp {
  createdAt: string;
  updatedAt: string;
}

export interface UserCreatedTimeStamp {
  user: UserSummary;
  timeStamp: TimeStamp;
}
