export type TradeIntent = {
  item?: {
    category?: string;
    baseType?: string;
    rarity?: string;
  };
  trade?: {
    status?: 'online' | 'any';
    saleType?: 'instant_buyout' | 'any';
    maxPrice?: {
      amount: number;
      currency: string;
    };
  };
  groups: Array<Record<string, unknown>>;
};

export type BuildTradeLinkResult =
  | {
      ok: true;
      url: string;
      searchId: string;
      intent: TradeIntent;
      resolved: unknown;
      compiledQuery: unknown;
      rawResponse: unknown;
    }
  | {
      ok: false;
      error: string;
      intent?: TradeIntent;
      resolved?: unknown;
      compiledQuery?: unknown;
    };

