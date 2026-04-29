export type UserRole = "admin" | "analyst" | "user";

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserRecord extends PublicUser {
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  password: string | null;
  role: UserRole;
}

export interface RequestLike {
  body: any;
  params: Record<string, string>;
}

export interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): ResponseLike;
}
