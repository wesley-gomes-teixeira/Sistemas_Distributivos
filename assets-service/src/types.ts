export interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  userId: number | null;
}

export interface AssetPayload {
  name: string;
  type: string;
  status: string;
  userId: number | null;
}

export interface RequestLike {
  body: any;
  params: Record<string, string>;
}

export interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): ResponseLike;
}
