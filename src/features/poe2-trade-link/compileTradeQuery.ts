import { TRADE_QUERY_TEMPLATES, TradeQueryTemplate } from './templates';
import { ResolvedTradeGroup, ResolvedTradeIntent } from './types';

export type PoeTradeQueryAdapter = {
  compile(resolved: ResolvedTradeIntent): unknown;
};

function compileStatGroup(group: ResolvedTradeGroup): unknown {
  const filters = group.stats.map((stat) => ({
    id: stat.id,
    value: {
      ...(stat.min !== undefined ? { min: stat.min } : {}),
      ...(stat.max !== undefined ? { max: stat.max } : {}),
    },
    ...(stat.weight !== undefined ? { weight: stat.weight } : {}),
    disabled: false,
  }));

  if (group.type === 'count') {
    return {
      type: 'count',
      value: { min: group.minCount },
      filters,
      disabled: false,
    };
  }

  if (group.type === 'weight') {
    return {
      type: 'weight',
      value: {
        min: group.min,
        ...(group.max !== undefined ? { max: group.max } : {}),
      },
      filters,
      disabled: false,
    };
  }

  return {
    type: 'and',
    filters,
    disabled: false,
  };
}

function compileQueryFilters(resolved: ResolvedTradeIntent): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  const itemCategory = resolved.item?.category;

  if (itemCategory) {
    const categoryOption = itemCategory === 'ring' ? 'accessory.ring' : itemCategory;
    filters.type_filters = {
      filters: {
        category: { option: categoryOption },
      },
    };
  }

  if (resolved.item?.rarity) {
    filters.type_filters = {
      ...((filters.type_filters as Record<string, unknown>) || {}),
      filters: {
        ...(((filters.type_filters as { filters?: Record<string, unknown> })?.filters) || {}),
        rarity: { option: resolved.item.rarity },
      },
    };
  }

  if (resolved.trade?.saleType === 'instant_buyout' || resolved.trade?.maxPrice) {
    filters.trade_filters = {
      filters: {
        ...(resolved.trade.saleType === 'instant_buyout'
          ? { sale_type: { option: 'priced' } }
          : {}),
        ...(resolved.trade.maxPrice
          ? {
              price: {
                max: resolved.trade.maxPrice.amount,
                option: resolved.trade.maxPrice.currency,
              },
            }
          : {}),
      },
    };
  }

  return filters;
}

function collectTags(resolved: ResolvedTradeIntent): Set<string> {
  return new Set(
    resolved.groups.flatMap((group) => group.stats.map((stat) => stat.tag)),
  );
}

function findTemplate(
  resolved: ResolvedTradeIntent,
  templates: TradeQueryTemplate[],
): TradeQueryTemplate | undefined {
  const tags = collectTags(resolved);
  return templates.find((template) => {
    const categoryMatches = !template.matchIntent.itemCategory
      || template.matchIntent.itemCategory === resolved.item?.category;
    return categoryMatches
      && template.matchIntent.requiredTags.every((tag) => tags.has(tag));
  });
}

function replaceTemplateValues(
  value: unknown,
  replacements: Record<string, unknown>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => replaceTemplateValues(entry, replacements));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        replaceTemplateValues(entry, replacements),
      ]),
    );
  }
  if (typeof value === 'string' && value in replacements) {
    return replacements[value];
  }
  return value;
}

function compileFromTemplate(
  template: TradeQueryTemplate,
  resolved: ResolvedTradeIntent,
): unknown {
  const weightGroup = resolved.groups.find((group) => group.type === 'weight');
  const countGroup = resolved.groups.find((group) => group.type === 'count');
  const replacements: Record<string, unknown> = {};
  const values: Record<string, unknown> = {
    status: resolved.trade?.status || 'online',
    baseType: resolved.item?.baseType || '',
    compiledStats: resolved.groups.map(compileStatGroup),
    queryFilters: compileQueryFilters(resolved),
    weightMin: weightGroup?.type === 'weight' ? weightGroup.min : undefined,
    weightFilters: weightGroup?.type === 'weight'
      ? (compileStatGroup(weightGroup) as { filters: unknown }).filters
      : [],
    countMin: countGroup?.type === 'count' ? countGroup.minCount : undefined,
    countFilters: countGroup?.type === 'count'
      ? (compileStatGroup(countGroup) as { filters: unknown }).filters
      : [],
  };

  for (const [variableName, placeholder] of Object.entries(template.variables)) {
    replacements[placeholder] = values[variableName];
  }

  return replaceTemplateValues(template.rawQueryTemplate, replacements);
}

export class Poe2Trade2Adapter implements PoeTradeQueryAdapter {
  constructor(private readonly templates = TRADE_QUERY_TEMPLATES) {}

  compile(resolved: ResolvedTradeIntent): unknown {
    const template = findTemplate(resolved, this.templates);
    if (template) return compileFromTemplate(template, resolved);

    return {
      query: {
        status: { option: resolved.trade?.status || 'online' },
        ...(resolved.item?.baseType ? { type: resolved.item.baseType } : {}),
        stats: resolved.groups.map(compileStatGroup),
        filters: compileQueryFilters(resolved),
      },
      sort: { price: 'asc' },
    };
  }
}

export function compileTradeQuery(
  resolved: ResolvedTradeIntent,
  _league: string,
  adapter: PoeTradeQueryAdapter = new Poe2Trade2Adapter(),
): unknown {
  return adapter.compile(resolved);
}
