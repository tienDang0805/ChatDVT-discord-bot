import { MOCK_TRADE_STATS, TradeStatCatalogItem } from './statCatalog';
import {
  ResolvedStat,
  ResolvedTradeGroup,
  ResolvedTradeIntent,
  TradeGroupIntent,
  TradeIntent,
} from './types';

function resolveStats(
  group: TradeGroupIntent,
  itemCategory: string | undefined,
  catalog: TradeStatCatalogItem[],
): ResolvedStat[] {
  const matches = catalog.filter((stat) => {
    const tagMatches = stat.tags.includes(group.tag);
    const scopeMatches = !stat.itemScopes?.length
      || !itemCategory
      || stat.itemScopes.includes(itemCategory);
    return tagMatches && scopeMatches;
  });

  if (matches.length === 0) {
    throw new Error(`Cannot resolve tag: ${group.tag}`);
  }

  return matches.map((stat) => ({
    id: stat.id,
    label: stat.label,
    tag: group.tag,
    min: group.type === 'count' ? group.statMin : group.type === 'and' ? group.min : undefined,
    max: group.type === 'count' ? group.statMax : group.type === 'and' ? group.max : undefined,
    weight: group.type === 'weight' ? 1 : undefined,
  }));
}

function resolveGroup(
  group: TradeGroupIntent,
  itemCategory: string | undefined,
  catalog: TradeStatCatalogItem[],
): ResolvedTradeGroup {
  const stats = resolveStats(group, itemCategory, catalog);

  if (group.type === 'count') {
    return {
      type: 'count',
      label: `${group.minCount}+ ${group.tag}`,
      minCount: group.minCount,
      stats,
    };
  }

  if (group.type === 'weight') {
    return {
      type: 'weight',
      label: `Weighted ${group.tag}`,
      min: group.min,
      max: group.max,
      stats,
    };
  }

  return {
    type: 'and',
    label: group.tag,
    stats,
  };
}

export function resolveTradeIntent(
  intent: TradeIntent,
  catalog: TradeStatCatalogItem[] = MOCK_TRADE_STATS,
): ResolvedTradeIntent {
  return {
    item: intent.item,
    trade: intent.trade,
    groups: intent.groups.map((group) => resolveGroup(group, intent.item?.category, catalog)),
  };
}

