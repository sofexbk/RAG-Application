export type AuthResponse = {
  access_token: string;
  token_type?: "bearer";
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type QueryResponse = {
  answer: string;
  sources: Array<{ id?: string | number; payload?: any; score?: number; }>;
};
