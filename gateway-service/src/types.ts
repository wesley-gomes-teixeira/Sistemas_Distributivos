export type UserRole = "admin" | "analyst" | "user";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface ServiceError extends Error {
  status?: number;
}

export interface RequestLike {
  body: any;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string | undefined>;
  method: string;
  originalUrl: string;
  user?: AuthenticatedUser;
}

export interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): ResponseLike;
  sendStatus(code: number): ResponseLike;
  header(name: string, value: string): void;
}

export type NextFunction = () => void;

export interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  userId: number | null;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  assetId: number | null;
}
