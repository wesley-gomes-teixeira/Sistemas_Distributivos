export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  assetId: number | null;
}

export interface TicketPayload {
  title: string;
  description: string;
  status: string;
  assetId: number | null;
}

export interface RequestLike {
  body: any;
  params: Record<string, string>;
}

export interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): ResponseLike;
}
