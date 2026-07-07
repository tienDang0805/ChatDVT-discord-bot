import { z } from 'zod';

export type TradeStatus = 'online' | 'any';
export type SaleType = 'instant_buyout' | 'any';

export type TradeIntent = {
  item?: {
    category?: string;
    baseType?: string;
    rarity?: string;
  };
  trade?: {
    status?: TradeStatus;
    saleType?: SaleType;
    maxPrice?: {
      amount: number;
      currency: string;
    };
  };
  groups: TradeGroupIntent[];
};

export type TradeGroupIntent =
  | AndGroupIntent
  | CountGroupIntent
  | WeightGroupIntent;

export type AndGroupIntent = {
  type: 'and';
  tag: string;
  min?: number;
  max?: number;
};

export type CountGroupIntent = {
  type: 'count';
  tag: string;
  minCount: number;
  statMin?: number;
  statMax?: number;
};

export type WeightGroupIntent = {
  type: 'weight';
  tag: string;
  min: number;
  max?: number;
};

export type ResolvedStat = {
  id: string;
  label: string;
  tag: string;
  min?: number;
  max?: number;
  weight?: number;
};

export type ResolvedTradeIntent = {
  item?: TradeIntent['item'];
  trade?: TradeIntent['trade'];
  groups: ResolvedTradeGroup[];
};

export type ResolvedTradeGroup =
  | {
      type: 'and';
      label: string;
      stats: ResolvedStat[];
    }
  | {
      type: 'count';
      label: string;
      minCount: number;
      stats: ResolvedStat[];
    }
  | {
      type: 'weight';
      label: string;
      min: number;
      max?: number;
      stats: ResolvedStat[];
    };

export type BuildTradeLinkResult =
  | {
      ok: true;
      url: string;
      searchId: string;
      intent: TradeIntent;
      resolved: ResolvedTradeIntent;
      compiledQuery: unknown;
      rawResponse: unknown;
    }
  | {
      ok: false;
      error: string;
      intent?: TradeIntent;
      resolved?: ResolvedTradeIntent;
      compiledQuery?: unknown;
    };

const itemSchema = z.object({
  category: z.string().trim().min(1).optional(),
  baseType: z.string().trim().min(1).optional(),
  rarity: z.string().trim().min(1).optional(),
}).strict();

const tradeSchema = z.object({
  status: z.enum(['online', 'any']).optional(),
  saleType: z.enum(['instant_buyout', 'any']).optional(),
  maxPrice: z.object({
    amount: z.number().finite().nonnegative(),
    currency: z.string().trim().min(1),
  }).strict().optional(),
}).strict();

const andGroupSchema = z.object({
  type: z.literal('and'),
  tag: z.string().trim().min(1),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
}).strict();

const countGroupSchema = z.object({
  type: z.literal('count'),
  tag: z.string().trim().min(1),
  minCount: z.number().int().positive(),
  statMin: z.number().finite().optional(),
  statMax: z.number().finite().optional(),
}).strict();

const weightGroupSchema = z.object({
  type: z.literal('weight'),
  tag: z.string().trim().min(1),
  min: z.number().finite(),
  max: z.number().finite().optional(),
}).strict();

export const tradeIntentSchema: z.ZodType<TradeIntent> = z.object({
  item: itemSchema.optional(),
  trade: tradeSchema.optional(),
  groups: z.array(z.discriminatedUnion('type', [
    andGroupSchema,
    countGroupSchema,
    weightGroupSchema,
  ])).max(20),
}).strict();

