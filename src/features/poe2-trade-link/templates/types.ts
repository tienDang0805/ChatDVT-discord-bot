export type TradeQueryTemplate = {
  id: string;
  name: string;
  description?: string;
  matchIntent: {
    itemCategory?: string;
    requiredTags: string[];
  };
  rawQueryTemplate: unknown;
  variables: Record<string, string>;
};

