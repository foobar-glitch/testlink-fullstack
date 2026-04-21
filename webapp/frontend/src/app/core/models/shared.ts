// ─── shared.ts ────────────────────────────────────────────────────────────────

export interface UserSummaryDTO {
  userId:   string;
  username: string;
  email:    string;
}

export interface TimeStampDTO {
  createdAt: string;
  updatedAt?: string;
}

export interface UserCreatedTimeStampDTO {
  createdBy: UserSummaryDTO;
  timeStamp: TimeStampDTO;
}
